import sys

with open('src/components/dashboard/Content/AIApplication.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad_part = """            </div>
          </div>
        </div>

                </div>
              ) : (
                <>
                  <p
                    style={{
                      fontSize: `${Math.round(20 * scale)}px`,
                      fontWeight: 600,"""

good_part = """            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: "flex", gap: `${Math.round(8 * scale)}px` }}>
          {["chat", "upload", "bulk"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: `${Math.round(8 * scale)}px ${Math.round(16 * scale)}px`,
                background: activeTab === tab ? t.tabActiveBg : t.tabInactiveBg,
                color: activeTab === tab ? t.accentColor : t.textDim,
                border: `1px solid ${activeTab === tab ? t.tabActiveBorder : t.tabInactiveBorder}`,
                borderRadius: `${Math.round(8 * scale)}px`,
                fontSize: `${Math.round(13 * scale)}px`,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                textTransform: "capitalize",
              }}
            >
              {tab === "upload" ? "Document Upload" : tab === "bulk" ? "Bulk Import" : "Chat"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        {activeTab === "chat" ? (
          <div
            style={{
              flex: 1,
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: `${Math.round(16 * scale)}px`,
              overflow: "hidden",
              animation: "fadeIn 0.4s ease",
            }}
          >
            <ChatWidget scale={scale} isFloating={false} isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === "upload" ? (
          <div
            style={{
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: `${Math.round(16 * scale)}px`,
              padding: `${Math.round(32 * scale)}px`,
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              animation: "fadeIn 0.4s ease",
            }}
          >
            {!uploadResult && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px dashed ${dragActive ? t.accentColor : t.uploadBorderColor}`,
                  borderRadius: `${Math.round(16 * scale)}px`,
                  background: dragActive ? t.uploadActiveBg : t.uploadBg,
                  padding: `${Math.round(40 * scale)}px`,
                  transition: "all 0.3s ease",
                  textAlign: "center",
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadFile ? (
                  <div style={{ animation: "fadeIn 0.4s ease" }}>
                    <div
                      style={{
                        width: `${Math.round(64 * scale)}px`,
                        height: `${Math.round(64 * scale)}px`,
                        borderRadius: "50%",
                        background: t.successBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        marginBottom: `${Math.round(16 * scale)}px`,
                        border: `1px solid ${t.successBorder}`,
                      }}
                    >
                      <svg
                        width={Math.round(32 * scale)}
                        height={Math.round(32 * scale)}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={t.successText}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                      </svg>
                    </div>
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
                        color: t.textDim,
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
                      fontWeight: 600,"""

if bad_part in content:
    content = content.replace(bad_part, good_part)
    with open('src/components/dashboard/Content/AIApplication.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Could not find bad_part!")
