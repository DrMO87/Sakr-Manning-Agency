import sys
import re

file_path = "src/components/dashboard/Content/AIApplication.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add elapsedTime state
if "const [elapsedTime, setElapsedTime] = useState(0);" not in content:
    content = content.replace(
        'const [uploading, setUploading] = useState(false);',
        'const [uploading, setUploading] = useState(false);\n  const [elapsedTime, setElapsedTime] = useState(0);'
    )

# 2. Update handleUpload
if "setElapsedTime(0);" not in content:
    content = content.replace(
        '''    setUploading(true);
    setUploadResult(null);''',
        '''    setUploading(true);
    setUploadResult(null);
    setElapsedTime(0);

    const timerStart = Date.now();
    const timerInterval = setInterval(() => {
      setElapsedTime(((Date.now() - timerStart) / 1000).toFixed(1));
    }, 100);'''
    )

if "clearInterval(timerInterval);" not in content:
    content = content.replace(
        '''      const result = await aiApi.uploadDocument(uploadFile, aiApiKeys);''',
        '''      const result = await aiApi.uploadDocument(uploadFile, aiApiKeys);

      clearInterval(timerInterval);
      setElapsedTime(((Date.now() - timerStart) / 1000).toFixed(1));'''
    )
    content = content.replace(
        '''    } catch (err) {
      alert(`Upload failed: ${err.message}`);''',
        '''    } catch (err) {
      clearInterval(timerInterval);
      setElapsedTime(((Date.now() - timerStart) / 1000).toFixed(1));
      alert(`Upload failed: ${err.message}`);'''
    )

# 3. Update the Uploading button text
content = content.replace(
    '''{uploading ? "Processing..." : "Upload & Process"}''',
    '''{uploading ? `Processing... (${elapsedTime}s)` : "Upload & Process"}'''
)

# 4. Add the Photo block and relative positioning
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
print("Fully restored!")
