import React, { useState, useEffect } from "react";

const ApiKeysManager = ({ scale = 1, isDarkMode = false, t, onClose }) => {
  // Default structure
  const defaultKeys = {
    groq: [{ key: "", status: "live", reset_time: null }],
    gemini: "",
  };

  const [apiKeys, setApiKeys] = useState(defaultKeys);

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem("aiApiKeys");
      if (stored) {
        setApiKeys(JSON.parse(stored));
      } else {
        // Migration from legacy single key
        const legacyGroq = localStorage.getItem("groqApiKey") || localStorage.getItem("groq_api_key");
        if (legacyGroq) {
          const newKeys = {
            groq: [{ key: legacyGroq, status: "live", reset_time: null }],
            gemini: "",
          };
          setApiKeys(newKeys);
          localStorage.setItem("aiApiKeys", JSON.stringify(newKeys));
        }
      }
    } catch (e) {
      console.error("Error loading API keys", e);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("aiApiKeys", JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Handle Groq key changes
  const handleGroqChange = (index, value) => {
    const newGroq = [...apiKeys.groq];
    newGroq[index].key = value;
    // Reset status when key changes
    newGroq[index].status = "live";
    newGroq[index].reset_time = null;
    setApiKeys({ ...apiKeys, groq: newGroq });
  };

  const addGroqKey = () => {
    setApiKeys({
      ...apiKeys,
      groq: [...apiKeys.groq, { key: "", status: "live", reset_time: null }],
    });
  };

  const removeGroqKey = (index) => {
    const newGroq = [...apiKeys.groq];
    newGroq.splice(index, 1);
    if (newGroq.length === 0) {
      newGroq.push({ key: "", status: "live", reset_time: null });
    }
    setApiKeys({ ...apiKeys, groq: newGroq });
  };

  // Live countdown timer hook
  const [now, setNow] = useState(Date.now() / 1000);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (resetTime) => {
    if (!resetTime) return "";
    const diff = resetTime - now;
    if (diff <= 0) return "Resetting...";
    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = Math.floor(diff % 60);
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        backgroundColor: t.cardBg,
        border: t.cardBorder,
        borderRadius: `${Math.round(16 * scale)}px`,
        width: `${Math.round(500 * scale)}px`,
        maxWidth: "90%",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        color: t.text
      }}>
        {/* Header */}
        <div style={{
          padding: `${Math.round(20 * scale)}px`,
          borderBottom: t.cardBorder,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: `${Math.round(20 * scale)}px`, fontWeight: 600 }}>API Keys Management</h2>
          <button 
            onClick={onClose}
            style={{
              background: "transparent", border: "none", color: t.textMuted, fontSize: `${Math.round(24 * scale)}px`, cursor: "pointer"
            }}
          >&times;</button>
        </div>

        {/* Content */}
        <div style={{ padding: `${Math.round(20 * scale)}px` }}>
          
          <div style={{ marginBottom: `${Math.round(24 * scale)}px` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: `${Math.round(12 * scale)}px` }}>
              <h3 style={{ margin: 0, fontSize: `${Math.round(16 * scale)}px`, color: t.accentColor }}>Groq API Keys</h3>
              <button 
                onClick={addGroqKey}
                style={{
                  background: t.accentBg || "rgba(0, 101, 175, 0.1)",
                  color: t.accentColor,
                  border: "none",
                  borderRadius: `${Math.round(4 * scale)}px`,
                  padding: `${Math.round(6 * scale)}px ${Math.round(12 * scale)}px`,
                  cursor: "pointer",
                  fontSize: `${Math.round(12 * scale)}px`,
                  fontWeight: 600
                }}
              >+ Add Key</button>
            </div>
            
            <p style={{ fontSize: `${Math.round(12 * scale)}px`, color: t.textMuted, marginBottom: `${Math.round(16 * scale)}px`, marginTop: 0 }}>
              Add multiple Groq API keys. The system will automatically shift to the next key if one reaches its 100,000 token-per-day limit.
            </p>

            {apiKeys.groq.map((groqItem, index) => {
              const isExhausted = groqItem.reset_time && groqItem.reset_time > now;
              const statusColor = isExhausted ? "#ef4444" : "#10b981";
              
              return (
                <div key={index} style={{ marginBottom: `${Math.round(16 * scale)}px`, background: "rgba(0,0,0,0.1)", padding: `${Math.round(12 * scale)}px`, borderRadius: `${Math.round(8 * scale)}px` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: `${Math.round(8 * scale)}px` }}>
                    <span style={{ fontSize: `${Math.round(13 * scale)}px`, fontWeight: 500 }}>Key {index + 1}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor }}></div>
                      <span style={{ fontSize: `${Math.round(12 * scale)}px`, color: statusColor }}>
                        {isExhausted ? `Quota Reached (Resets in ${formatCountdown(groqItem.reset_time)})` : "Live"}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="password"
                      value={groqItem.key}
                      onChange={(e) => handleGroqChange(index, e.target.value)}
                      placeholder="gsk_..."
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.05)",
                        border: t.cardBorder,
                        borderRadius: `${Math.round(6 * scale)}px`,
                        padding: `${Math.round(8 * scale)}px ${Math.round(12 * scale)}px`,
                        color: t.text,
                        fontSize: `${Math.round(14 * scale)}px`
                      }}
                    />
                    <button 
                      onClick={() => removeGroqKey(index)}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: `${Math.round(6 * scale)}px`,
                        padding: `0 ${Math.round(12 * scale)}px`,
                        cursor: "pointer"
                      }}
                    >X</button>
                  </div>
                </div>
              );
            })}
          </div>

          <hr style={{ border: 0, borderTop: t.cardBorder, margin: `${Math.round(24 * scale)}px 0` }} />

          <div>
            <h3 style={{ margin: 0, fontSize: `${Math.round(16 * scale)}px`, color: "#a855f7", marginBottom: `${Math.round(12 * scale)}px` }}>Google Gemini Fallback (Optional)</h3>
            <p style={{ fontSize: `${Math.round(12 * scale)}px`, color: t.textMuted, marginBottom: `${Math.round(16 * scale)}px`, marginTop: 0 }}>
              Used as a fallback if all Groq keys are exhausted. Uses the free-tier <b>gemini-2.5-flash</b> model.
            </p>
            <input
              type="password"
              value={apiKeys.gemini}
              onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
              placeholder="AIzaSy..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: t.cardBorder,
                borderRadius: `${Math.round(6 * scale)}px`,
                padding: `${Math.round(10 * scale)}px ${Math.round(12 * scale)}px`,
                color: t.text,
                fontSize: `${Math.round(14 * scale)}px`
              }}
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: `${Math.round(16 * scale)}px ${Math.round(20 * scale)}px`,
          borderTop: t.cardBorder,
          display: "flex",
          justifyContent: "flex-end"
        }}>
          <button 
            onClick={onClose}
            style={{
              background: t.accentColor,
              color: isDarkMode ? "#000" : "#fff",
              border: "none",
              borderRadius: `${Math.round(6 * scale)}px`,
              padding: `${Math.round(10 * scale)}px ${Math.round(20 * scale)}px`,
              cursor: "pointer",
              fontSize: `${Math.round(14 * scale)}px`,
              fontWeight: 600
            }}
          >Done</button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeysManager;
