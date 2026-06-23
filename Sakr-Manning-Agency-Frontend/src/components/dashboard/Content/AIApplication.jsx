/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import ChatWidget from "../Components/AI/ChatWidget";
import aiApi from "../../../services/Dashboard/aiApi";
import { ASSETS } from "../../../utils/constants";
import AnimatedRobotIcon from "../Components/AI/AnimatedRobotIcon";
import CompactCVEditForm from "../Components/AI/CompactCVEditForm";

const AIApplication = ({ scale = 1, isMobile = false, isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [saving, setSaving] = useState(false);

  // Theme tokens
  const t = isDarkMode
    ? {
        bg: "linear-gradient(135deg, #0B0F19 0%, #1A1B41 100%)",
        cardBg: "rgba(15, 23, 42, 0.6)",
        cardBorder: "rgba(255, 255, 255, 0.08)",
        text: "#E2E8F0",
        textMuted: "#94A3B8",
        textDim: "#64748B",
        titleGradient: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
        accentColor: "#00f2fe",
        accentBg: "rgba(0, 242, 254, 0.1)",
        accentBorder: "rgba(0, 242, 254, 0.4)",
        accentShadow: "0 0 20px rgba(0, 242, 254, 0.2)",
        tabActiveBg: "rgba(79, 172, 254, 0.15)",
        tabActiveBorder: "rgba(0, 242, 254, 0.5)",
        tabInactiveBg: "rgba(255, 255, 255, 0.03)",
        tabInactiveBorder: "rgba(255, 255, 255, 0.1)",
        uploadBg: "rgba(0, 0, 0, 0.2)",
        uploadBorderColor: "rgba(255, 255, 255, 0.2)",
        uploadActiveBg: "rgba(0, 242, 254, 0.05)",
        successBg: "rgba(16, 185, 129, 0.1)",
        successBorder: "rgba(16, 185, 129, 0.3)",
        successText: "#34d399",
        successTextLight: "#6ee7b7",
        infoBg: "rgba(56, 189, 248, 0.05)",
        infoBorder: "rgba(56, 189, 248, 0.2)",
        infoAccent: "#38bdf8",
        infoText: "#cbd5e1",
        dangerBg: "rgba(239, 68, 68, 0.1)",
        dangerBorder: "rgba(239, 68, 68, 0.3)",
        dangerText: "#ef4444",
        btnGradient: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
        btnShadow: "0 4px 15px rgba(0, 242, 254, 0.3)",
      }
    : {
        bg: "linear-gradient(135deg, #f0f4f8 0%, #e8eef5 50%, #f5f7fa 100%)",
        cardBg: "rgba(255, 255, 255, 0.85)",
        cardBorder: "rgba(0, 101, 175, 0.1)",
        text: "#1e293b",
        textMuted: "#64748b",
        textDim: "#94a3b8",
        titleGradient: "linear-gradient(135deg, #0065AF 0%, #2563eb 100%)",
        accentColor: "#0065AF",
        accentBg: "rgba(0, 101, 175, 0.08)",
        accentBorder: "rgba(0, 101, 175, 0.3)",
        accentShadow: "0 4px 20px rgba(0, 101, 175, 0.12)",
        tabActiveBg: "linear-gradient(135deg, #0065AF 0%, #2563eb 100%)",
        tabActiveBorder: "transparent",
        tabInactiveBg: "rgba(255, 255, 255, 0.8)",
        tabInactiveBorder: "rgba(0, 0, 0, 0.08)",
        uploadBg: "#f8fafc",
        uploadBorderColor: "#cbd5e1",
        uploadActiveBg: "#eff6ff",
        successBg: "#f0fdf4",
        successBorder: "#86efac",
        successText: "#166534",
        successTextLight: "#22c55e",
        infoBg: "#eff6ff",
        infoBorder: "#bfdbfe",
        infoAccent: "#0065AF",
        infoText: "#334155",
        dangerBg: "#fef2f2",
        dangerBorder: "#fca5a5",
        dangerText: "#dc2626",
        btnGradient: "linear-gradient(135deg, #0065AF 0%, #2563eb 100%)",
        btnShadow: "0 4px 15px rgba(0, 101, 175, 0.25)",
      };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setUploadFile(file);
      }
    }
  };

  const validateFile = (file) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file");
      return false;
    }

    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setUploadFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    const groqApiKey = localStorage.getItem("groq_api_key");
    const result = await aiApi.uploadDocument(uploadFile, groqApiKey);

    if (result.success) {
      setUploadResult(result.data);
      setExtractedData(result.data.extracted_data || {});
    }

    setUploading(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await aiApi.saveApplicantData(extractedData, uploadFile?.name || "manual_upload.pdf");
      if (result && result.success) {
        if (result.status === 206) {
          alert(`Warning: ${result.data._upload_meta?.message || 'Some data could not be saved properly.'}\nError: ${result.data._upload_meta?.user_error || 'Validation failed.'}`);
        } else {
          alert("Applicant saved successfully!");
        }
        setUploadFile(null);
        setUploadResult(null);
        setExtractedData(null);
      }
    } catch (e) {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const headerHeight = Math.round(80 * scale);

  return (
    <main
      style={{
        padding: `${Math.round(16 * scale)}px`,
        paddingTop: `calc(${headerHeight}px + ${Math.round(16 * scale)}px)`,
        display: "flex",
        flexDirection: "column",
        flex: 1,
        background: t.bg,
        height: "100vh",
        color: t.text,
        transition: "all 0.4s ease",
        overflow: activeTab === "chat" ? "hidden" : "auto",
      }}
    >
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
        </div>

        {/* Tabs inside header */}
        <div
          style={{
            display: "flex",
            gap: `${Math.round(8 * scale)}px`,
            background: t.tabInactiveBg,
            padding: `${Math.round(4 * scale)}px`,
            borderRadius: `${Math.round(20 * scale)}px`,
            border: `1px solid ${t.tabInactiveBorder}`,
          }}
        >
          {[
            { id: "chat", label: "AI Chat", icon: "💬" },
            { id: "upload", label: "Upload Document", icon: "📄" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: `${Math.round(8 * scale)}px ${Math.round(16 * scale)}px`,
                background:
                  activeTab === tab.id ? t.tabActiveBg : "transparent",
                color:
                  activeTab === tab.id
                    ? (isDarkMode ? t.accentColor : "#fff")
                    : t.textMuted,
                border: "none",
                borderRadius: `${Math.round(16 * scale)}px`,
                fontSize: `${Math.round(14 * scale)}px`,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTab === tab.id
                  ? (isDarkMode ? "0 0 15px rgba(0,242,254,0.15)" : "0 4px 12px rgba(0,101,175,0.2)")
                  : "none",
              }}
            >
              <span style={{ fontSize: `${Math.round(16 * scale)}px` }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {activeTab === "chat" ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              minHeight: 0,
            }}
          >
            <ChatWidget scale={scale} isFloating={false} isDarkMode={isDarkMode} />
          </div>
        ) : (
          <div
            style={{
              background: t.cardBg,
              backdropFilter: "blur(20px)",
              border: `1px solid ${t.cardBorder}`,
              borderRadius: `${Math.round(24 * scale)}px`,
              padding: `${Math.round(40 * scale)}px`,
              boxShadow: isDarkMode ? "0 20px 40px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.06)",
              transition: "all 0.4s ease",
            }}
          >
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `2.5px dashed ${dragActive ? t.accentColor : t.uploadBorderColor}`,
                borderRadius: `${Math.round(20 * scale)}px`,
                padding: `${Math.round(60 * scale)}px`,
                textAlign: "center",
                background: dragActive ? t.uploadActiveBg : t.uploadBg,
                transition: "all 0.3s ease",
                marginBottom: `${Math.round(32 * scale)}px`,
              }}
            >
              <div
                style={{
                  fontSize: `${Math.round(64 * scale)}px`,
                  marginBottom: `${Math.round(20 * scale)}px`,
                  transition: "all 0.3s ease",
                }}
              >
                📄
              </div>

              {uploadFile ? (
                <div>
                  <p
                    style={{
                      fontSize: `${Math.round(18 * scale)}px`,
                      fontWeight: 600,
                      color: t.text,
                      marginBottom: `${Math.round(8 * scale)}px`,
                    }}
                  >
                    {uploadFile.name}
                  </p>
                  <p
                    style={{
                      fontSize: `${Math.round(14 * scale)}px`,
                      color: t.textMuted,
                      marginBottom: `${Math.round(24 * scale)}px`,
                    }}
                  >
                    {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: `${Math.round(16 * scale)}px`,
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => setUploadFile(null)}
                      style={{
                        padding: `${Math.round(12 * scale)}px ${Math.round(28 * scale)}px`,
                        background: t.dangerBg,
                        color: t.dangerText,
                        border: `1px solid ${t.dangerBorder}`,
                        borderRadius: `${Math.round(12 * scale)}px`,
                        cursor: "pointer",
                        fontSize: `${Math.round(14 * scale)}px`,
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      Remove
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      style={{
                        padding: `${Math.round(12 * scale)}px ${Math.round(28 * scale)}px`,
                        background: uploading
                          ? (isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0")
                          : t.btnGradient,
                        color: uploading ? t.textMuted : "white",
                        border: "none",
                        borderRadius: `${Math.round(12 * scale)}px`,
                        cursor: uploading ? "not-allowed" : "pointer",
                        fontSize: `${Math.round(14 * scale)}px`,
                        fontWeight: 600,
                        transition: "all 0.2s",
                        boxShadow: uploading ? "none" : t.btnShadow,
                      }}
                    >
                      {uploading ? "Processing..." : "Upload & Process"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p
                    style={{
                      fontSize: `${Math.round(20 * scale)}px`,
                      fontWeight: 600,
                      color: t.text,
                      marginBottom: `${Math.round(12 * scale)}px`,
                    }}
                  >
                    Drag and drop your CV here
                  </p>
                  <p
                    style={{
                      fontSize: `${Math.round(14 * scale)}px`,
                      color: t.textDim,
                      marginBottom: `${Math.round(24 * scale)}px`,
                    }}
                  >
                    or
                  </p>
                  <label
                    style={{
                      display: "inline-block",
                      padding: `${Math.round(14 * scale)}px ${Math.round(36 * scale)}px`,
                      background: t.btnGradient,
                      color: "white",
                      borderRadius: `${Math.round(12 * scale)}px`,
                      cursor: "pointer",
                      fontSize: `${Math.round(15 * scale)}px`,
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      boxShadow: t.btnShadow,
                    }}
                  >
                    Browse Files
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx"
                      style={{ display: "none" }}
                    />
                  </label>
                  <p
                    style={{
                      fontSize: `${Math.round(13 * scale)}px`,
                      color: t.textDim,
                      marginTop: `${Math.round(24 * scale)}px`,
                    }}
                  >
                    Supported formats: PDF, DOCX (Max 10MB)
                  </p>
                </>
              )}
            </div>

            {/* Upload Success & Review */}
            {uploadResult && (
              <div
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  borderRadius: `${Math.round(16 * scale)}px`,
                  padding: `${Math.round(24 * scale)}px`,
                  marginBottom: `${Math.round(24 * scale)}px`,
                  animation: "fadeInDown 0.4s ease",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontSize: `${Math.round(20 * scale)}px`,
                      fontWeight: 700,
                      color: t.text,
                      marginBottom: `${Math.round(8 * scale)}px`,
                    }}
                  >
                    Extraction Successful. Please Review:
                  </h3>
                  <p
                    style={{
                      fontSize: `${Math.round(14 * scale)}px`,
                      color: t.textMuted,
                      maxWidth: "600px",
                      margin: "0 auto",
                      lineHeight: "1.5"
                    }}
                  >
                    Please review the extracted data carefully. Since CV layouts vary drastically, the AI may sometimes misidentify fields (e.g., extracting the wrong name or leaving required fields like email blank). 
                    <br/><br/>
                    <strong>You must manually correct any incorrect values in the JSON below before clicking Save & Approve.</strong>
                  </p>
                </div>
                
                <CompactCVEditForm 
                  data={extractedData} 
                  onChange={setExtractedData} 
                  scale={scale} 
                  isDarkMode={isDarkMode}
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    onClick={() => {
                      setUploadFile(null);
                      setUploadResult(null);
                      setExtractedData(null);
                    }}
                    style={{
                      padding: `${Math.round(10 * scale)}px ${Math.round(20 * scale)}px`,
                      backgroundColor: "transparent",
                      color: t.text,
                      border: `1px solid ${t.cardBorder}`,
                      borderRadius: `${Math.round(6 * scale)}px`,
                      cursor: "pointer",
                      fontSize: `${Math.round(14 * scale)}px`,
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: `${Math.round(10 * scale)}px ${Math.round(20 * scale)}px`,
                      background: saving ? t.textMuted : t.btnGradient,
                      color: "white",
                      border: "none",
                      borderRadius: `${Math.round(6 * scale)}px`,
                      cursor: saving ? "not-allowed" : "pointer",
                      fontSize: `${Math.round(14 * scale)}px`,
                      fontWeight: 500,
                      boxShadow: saving ? "none" : t.btnShadow,
                    }}
                  >
                    {saving ? "Saving..." : "Save & Approve"}
                  </button>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div
              style={{
                background: t.infoBg,
                border: `1px solid ${t.infoBorder}`,
                borderRadius: `${Math.round(16 * scale)}px`,
                padding: `${Math.round(28 * scale)}px`,
                marginTop: `${Math.round(24 * scale)}px`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "4px",
                  height: "100%",
                  background: t.infoAccent,
                  boxShadow: isDarkMode ? `0 0 10px ${t.infoAccent}` : "none",
                }}
              />
              <h4
                style={{
                  fontSize: `${Math.round(17 * scale)}px`,
                  fontWeight: 600,
                  color: t.infoAccent,
                  marginBottom: `${Math.round(16 * scale)}px`,
                  display: "flex",
                  alignItems: "center",
                  gap: `${Math.round(12 * scale)}px`,
                }}
              >
                <AnimatedRobotIcon size={Math.round(28 * scale)} state="idle" isDark={isDarkMode} />
                AI Document Processing
              </h4>
              <p
                style={{
                  fontSize: `${Math.round(15 * scale)}px`,
                  color: t.infoText,
                  margin: 0,
                  lineHeight: 1.7,
                }}
              >
                Our AI automatically extracts candidate information including
                name, email, phone, nationality, certificates, experience, and
                ranks from uploaded documents. The processed data is instantly
                available in the system.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
};

export default AIApplication;
