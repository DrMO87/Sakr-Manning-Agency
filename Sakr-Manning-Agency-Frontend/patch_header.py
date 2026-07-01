import sys

file_path = 'src/components/dashboard/Content/AIApplication.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''          <AnimatedRobotIcon size={Math.round(40 * scale)} state="online" isDark={isDarkMode} />
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
      </div>'''

replacement = '''          <AnimatedRobotIcon size={Math.round(40 * scale)} state="online" isDark={isDarkMode} />
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
                e.currentTarget.style.background = t.tabHoverBg || "rgba(0,0,0,0.05)";
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
            { id: "bulk", label: "Bulk Import", icon: "📂" },
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
      </div>'''

modal = '''      {/* Api Keys Manager Modal */}
      {showApiKeysManager && (
        <ApiKeysManager onClose={() => setShowApiKeysManager(false)} scale={scale} isDarkMode={isDarkMode} t={t} />
      )}
'''

import re
if target in content:
    content = content.replace(target, replacement)
    content = content.replace('{/* Compact Header & Tabs Bar */}', modal + '      {/* Compact Header & Tabs Bar */}')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Header and Tabs replaced successfully!')
else:
    print('Target not found in file!')
