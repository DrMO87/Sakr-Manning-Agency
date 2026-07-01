import sys
import os

file_path = r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Frontend\src\components\dashboard\Content\AIApplication.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add state hook for apiKeysStatus
state_hook = '''
  const [activeTab, setActiveTab] = useState("chat");
  const [apiKeysStatus, setApiKeysStatus] = useState(null);

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
      
      const groqKeys = apiKeysStatus.groq || [];
      for (const k of groqKeys) {
          if (!k.key) continue;
          if (k.status === "live") {
              if (!k.reset_time || Date.now()/1000 > k.reset_time) {
                  hasLive = true;
                  break;
              } else {
                  if (k.reset_time < shortestReset) shortestReset = k.reset_time;
              }
          } else if (k.status === "exhausted") {
              if (k.reset_time && Date.now()/1000 > k.reset_time) {
                  hasLive = true;
                  break;
              } else if (k.reset_time < shortestReset) {
                  shortestReset = k.reset_time;
              }
          }
      }
      
      if (hasLive) return { type: "live" };
      
      if (apiKeysStatus.gemini && !apiKeysStatus.gemini_exhausted) {
          return { type: "live" }; 
      }
      
      if (shortestReset !== Infinity) {
          const waitTimeStr = formatWaitTime(shortestReset - Date.now()/1000);
          if (waitTimeStr === "0m") return { type: "live" }; 
          return { type: "waiting", time: waitTimeStr };
      }
      
      return { type: "none" };
  };
  
  const apiStatus = getGlobalApiStatus();
'''

content = content.replace('  const [activeTab, setActiveTab] = useState("chat");', state_hook)

# Update UI block
ui_block = '''
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
                  <div style={{ 
                      width: `${Math.round(8 * scale)}px`, 
                      height: `${Math.round(8 * scale)}px`, 
                      borderRadius: "50%", 
                      background: "#22c55e",
                      boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)"
                  }} title="API Keys are Live" />
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
'''

import re
content = re.sub(
    r"<AnimatedRobotIcon.*?</button>\s*</div>",
    lambda m: ui_block.strip() + "\n",
    content,
    flags=re.DOTALL
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated AIApplication.jsx")
