import sys
import re

file_path = "src/components/dashboard/Content/AIApplication.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add imports
content = content.replace(
    'import CompactCVEditForm from "../Components/AI/CompactCVEditForm";',
    'import CompactCVEditForm from "../Components/AI/CompactCVEditForm";\nimport BulkImport from "../Components/AI/BulkImport";\nimport ApiKeysManager from "../Components/AI/ApiKeysManager";\nimport { Settings } from "lucide-react";'
)

# 2. Add state hooks
state_hook = '''  const [activeTab, setActiveTab] = useState("chat");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [apiKeysStatus, setApiKeysStatus] = useState(null);
  const [showApiKeysManager, setShowApiKeysManager] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      try {
        const str = localStorage.getItem("aiApiKeys");
        if (str) {
            setApiKeysStatus(JSON.parse(str));
        }
      } catch(e){}
    };
    updateStatus();
    window.addEventListener("storage", updateStatus);
    const interval = setInterval(updateStatus, 1000);
    return () => {
        window.removeEventListener("storage", updateStatus);
        clearInterval(interval);
    };
  }, []);

  const formatWaitTime = (seconds) => {
      if (seconds <= 0) return "0m";
      const m = Math.ceil(seconds / 60);
      if (m > 60) {
          const h = Math.floor(m / 60);
          const mins = m % 60;
          return `${h}h ${mins}m`;
      }
      return `${m}m`;
  };

  const getGlobalApiStatus = () => {
      if (!apiKeysStatus) return { type: "none" };
      let hasLive = false;
      let shortestReset = Infinity;
      let lastActive = null;
      
      const groqKeys = apiKeysStatus.groq || [];
      for (const k of groqKeys) {
          if (!k.key) continue;
          if (k.status === "live") {
              if (!k.reset_time || Date.now()/1000 > k.reset_time) {
                  hasLive = true;
                  lastActive = { model: "groq", key: "..." + k.key.slice(-4) };
                  break;
              } else {
                  if (k.reset_time < shortestReset) shortestReset = k.reset_time;
              }
          } else if (k.status === "exhausted") {
              if (k.reset_time && Date.now()/1000 > k.reset_time) {
                  hasLive = true;
                  lastActive = { model: "groq", key: "..." + k.key.slice(-4) };
                  break;
              } else if (k.reset_time < shortestReset) {
                  shortestReset = k.reset_time;
              }
          }
      }
      
      if (hasLive) return { type: "live", lastActive, tokens: apiKeysStatus.groq_tokens || 0 };
      
      if (apiKeysStatus.gemini && !apiKeysStatus.gemini_exhausted) {
          return { type: "live", lastActive: { model: "gemini", key: "..." + apiKeysStatus.gemini.slice(-4) }, tokens: apiKeysStatus.gemini_tokens || 0 }; 
      }
      
      if (shortestReset !== Infinity) {
          const waitTimeStr = formatWaitTime(shortestReset - Date.now()/1000);
          if (waitTimeStr === "0m") return { type: "live" }; 
          return { type: "waiting", time: waitTimeStr };
      }
      
      return { type: "none" };
  };
  
  const apiStatus = getGlobalApiStatus();

  const refreshKeysStatus = () => {
      try {
          const str = localStorage.getItem("aiApiKeys");
          if (str) setApiKeysStatus(JSON.parse(str));
      } catch(e){}
  };
'''
content = content.replace('  const [activeTab, setActiveTab] = useState("chat");', state_hook)

# 3. Update handleUpload
upload_logic_old = '''  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const result = await aiApi.uploadDocument(uploadFile);

      if (result.success) {
        setUploadResult(result.data);
        setExtractedData(result.data.extracted_data || {});
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }

    setUploading(false);
  };'''

upload_logic_new = '''  const handleUpload = async () => {
    if (!uploadFile) return;

    refreshKeysStatus();

    setUploading(true);
    setUploadResult(null);
    setElapsedTime(0);

    const timerStart = Date.now();
    const timerInterval = setInterval(() => {
      setElapsedTime(((Date.now() - timerStart) / 1000).toFixed(1));
    }, 100);

    let aiApiKeys = null;
    try {
        const aiApiKeysStr = localStorage.getItem("aiApiKeys");
        if (aiApiKeysStr) {
            aiApiKeys = JSON.parse(aiApiKeysStr);
        } else {
            const legacyGroq = localStorage.getItem("groqApiKey") || localStorage.getItem("groq_api_key");
            if (legacyGroq) aiApiKeys = { groq: [{ key: legacyGroq, status: "live", reset_time: null }], gemini: "" };
        }
    } catch(e){}

    try {
      const result = await aiApi.uploadDocument(uploadFile, aiApiKeys);

      clearInterval(timerInterval);
      setElapsedTime(((Date.now() - timerStart) / 1000).toFixed(1));

      if (result.success && result.data?.api_keys_status) {
          localStorage.setItem("aiApiKeys", JSON.stringify(result.data.api_keys_status));
      } else if (!result.success) {
          const errData = result.rawError?.response?.data;
          if (errData?.api_keys_status) {
              localStorage.setItem("aiApiKeys", JSON.stringify(errData.api_keys_status));
          }
      }

      refreshKeysStatus();

      if (result.success) {
        setUploadResult(result.data);
        setExtractedData(result.data.extracted_data || {});
      } else {
        if (result.error && result.error.toLowerCase().includes("exhausted")) {
            alert("All API keys exhausted. Please check API Keys Settings to see reset times or add a new key.");
        } else {
            alert(`Upload failed: ${result.error}`);
        }
      }
    } catch (err) {
      clearInterval(timerInterval);
      setElapsedTime(((Date.now() - timerStart) / 1000).toFixed(1));
      refreshKeysStatus();
      alert(`Upload failed: ${err.message}`);
    }

    setUploading(false);
  };'''
content = content.replace(upload_logic_old, upload_logic_new)


# 4. Update Header and Tabs
header_old = '''      {/* Compact Header & Tabs Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: `${Math.round(16 * scale)}px`,
          padding: `0 ${Math.round(8 * scale)}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: `${Math.round(12 * scale)}px`,
          }}
        >
          <AnimatedRobotIcon size={Math.round(40 * scale)} state="online" isDark={isDarkMode} />
          <div style={{ display: "flex", alignItems: "center", gap: `${Math.round(8 * scale)}px` }}>
            <h1
              style={{
                fontSize: `${Math.round(24 * scale)}px`,
                fontWeight: 800,
                margin: 0,
                background: t.titleGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.5px",
              }}
            >
              AI Assistant
            </h1>
            <span
              style={{
                fontSize: `${Math.round(12 * scale)}px`,
                fontWeight: 600,
                color: t.accentColor,
                background: t.accentBg,
                padding: `${Math.round(4 * scale)}px ${Math.round(8 * scale)}px`,
                borderRadius: `${Math.round(8 * scale)}px`,
              }}
            >
              Beta
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: "flex", gap: `${Math.round(8 * scale)}px` }}>
          {["chat", "upload"].map((tab) => ('''

header_new = '''      {/* Api Keys Manager Modal */}
      {showApiKeysManager && (
        <ApiKeysManager onClose={() => setShowApiKeysManager(false)} scale={scale} isDarkMode={isDarkMode} t={t} />
      )}

      {/* Compact Header & Tabs Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: `${Math.round(16 * scale)}px`,
          padding: `0 ${Math.round(8 * scale)}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: `${Math.round(12 * scale)}px`,
          }}
        >
          <AnimatedRobotIcon size={Math.round(40 * scale)} state="online" isDark={isDarkMode} />
          <div style={{ display: "flex", alignItems: "center", gap: `${Math.round(8 * scale)}px` }}>
            <div>
              <h1
                style={{
                  fontSize: `${Math.round(24 * scale)}px`,
                  fontWeight: 800,
                  margin: 0,
                  background: t.titleGradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.5px",
                  lineHeight: 1.2,
                }}
              >
                AI Assistant
              </h1>
              <p
                style={{
                  fontSize: `${Math.round(13 * scale)}px`,
                  color: t.textMuted,
                  margin: 0,
                }}
              >
                Nexus Core Data Link
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: `${Math.round(4 * scale)}px`, marginLeft: `${Math.round(4 * scale)}px` }}>
              <button
                onClick={() => setShowApiKeysManager(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: t.textMuted,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: `${Math.round(8 * scale)}px`,
                  borderRadius: `${Math.round(8 * scale)}px`,
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = t.accentColor;
                  e.currentTarget.style.background = t.tabHoverBg;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = t.textMuted;
                  e.currentTarget.style.background = "transparent";
                }}
                title="API Keys Settings"
              >
                <Settings size={Math.round(20 * scale)} />
              </button>
              
              {apiStatus.type === "live" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {apiStatus.lastActive && (
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px", 
                            background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", 
                            padding: "4px 8px", 
                            borderRadius: "12px", 
                            fontSize: "12px", 
                            color: t.textDim 
                        }}>
                          <span style={{ fontWeight: 600, color: t.text }}>{apiStatus.lastActive.model}</span>
                          <span>{apiStatus.lastActive.key}</span>
                          {apiStatus.tokens > 0 && <span style={{ color: t.accentColor, fontWeight: 600 }}>{apiStatus.tokens.toLocaleString()} tkns</span>}
                        </div>
                      )}
                      <div style={{ 
                          width: `${Math.round(8 * scale)}px`, 
                          height: `${Math.round(8 * scale)}px`, 
                          borderRadius: "50%", 
                          background: "#22c55e",
                          boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)"
                      }} title="API Keys are Live" />
                  </div>
              )}
              {apiStatus.type === "waiting" && (
                  <div style={{ 
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      padding: `${Math.round(4 * scale)}px ${Math.round(8 * scale)}px`,
                      borderRadius: `${Math.round(12 * scale)}px`,
                      fontSize: `${Math.round(11 * scale)}px`,
                      fontWeight: 600,
                      border: "1px solid rgba(239, 68, 68, 0.2)"
                  }} title="All keys exhausted">
                      {apiStatus.time}
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: "flex", gap: `${Math.round(8 * scale)}px` }}>
          {["chat", "upload", "bulk"].map((tab) => ('''
content = content.replace(header_old, header_new)

content = content.replace(
    '{tab === "upload" ? "Document Upload" : "Chat"}',
    '{tab === "upload" ? "Document Upload" : tab === "bulk" ? "Bulk Import" : "Chat"}'
)

# 5. Fix conditional logic activeTab === "upload" vs "bulk"
content = content.replace(
    '        ) : (\n          <div\n            style={{\n              background: t.cardBg,',
    '        ) : activeTab === "upload" ? (\n          <div\n            style={{\n              background: t.cardBg,'
)

content = content.replace(
    '              </div>\n            )}\n          </div>\n        )}\n      </div>',
    '              </div>\n            )}\n          </div>\n        ) : activeTab === "bulk" ? (\n          <div style={{ flex: 1, overflowY: "auto" }}>\n            <BulkImport scale={scale} isDarkMode={isDarkMode} t={t} />\n          </div>\n        ) : null}\n      </div>'
)

# 6. Elapsed Timer in Upload & Process
content = content.replace(
    '{uploading ? "Processing..." : "Upload & Process"}',
    '{uploading ? `Processing... (${elapsedTime}s)` : "Upload & Process"}'
)

# 7. Photo extraction block
photo_block = """            {/* Upload Success & Review */}
            {uploadResult && (
              <div
                style={{
                  position: "relative",
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  borderRadius: `${Math.round(16 * scale)}px`,
                  padding: `${Math.round(24 * scale)}px`,
                  marginBottom: `${Math.round(24 * scale)}px`,
                  animation: "fadeInDown 0.4s ease",
                }}
              >
                {extractedData?.extracted_photo_base64 && (
                  <div style={{ position: "absolute", top: `${Math.round(24 * scale)}px`, right: `${Math.round(24 * scale)}px`, textAlign: "center", animation: "fadeIn 0.6s ease", zIndex: 10 }}>
                    <div style={{ marginBottom: `${Math.round(6 * scale)}px`, fontSize: `${Math.round(12 * scale)}px`, color: t.textDim, fontWeight: 500 }}>
                      Profile Photo
                    </div>
                    <img
                      src={`data:image/jpeg;base64,${extractedData.extracted_photo_base64}`}
                      alt="Extracted Profile"
                      style={{
                        width: `${Math.round(110 * scale)}px`,
                        height: `${Math.round(110 * scale)}px`,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `3px solid ${t.accentBg}`,
                        boxShadow: t.accentShadow,
                        display: "block",
                        margin: "0 auto"
                      }}
                    />
                    <button
                      onClick={() => {
                        const newData = { ...extractedData };
                        delete newData.extracted_photo_base64;
                        setExtractedData(newData);
                      }}
                      style={{
                        marginTop: `${Math.round(8 * scale)}px`,
                        padding: `${Math.round(4 * scale)}px ${Math.round(12 * scale)}px`,
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: `${Math.round(4 * scale)}px`,
                        cursor: "pointer",
                        fontSize: `${Math.round(11 * scale)}px`,
                        fontWeight: 600,
                        transition: "background-color 0.2s",
                        outline: "none"
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                      onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
                    >
                      Remove Photo
                    </button>
                  </div>
                )}
                
                <div style={{ textAlign: "center", marginBottom: "20px", paddingRight: extractedData?.extracted_photo_base64 ? `${Math.round(140 * scale)}px` : "0" }}>"""

content = re.sub(
    r'\{\/\* Upload Success & Review \*\/\}\s*\{uploadResult && \(\s*<div\s*style=\{\{\s*background: t\.cardBg,.*?<div style=\{\{ textAlign: "center", marginBottom: "20px" \}\}>',
    photo_block,
    content,
    flags=re.DOTALL
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Master patch applied successfully!")
