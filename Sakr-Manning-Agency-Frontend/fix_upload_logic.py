import sys

file_path = 'src/components/dashboard/Content/AIApplication.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states back properly
content = content.replace(
    '  const [uploading, setUploading] = useState(false);\n\n  const [apiKeysStatus, setApiKeysStatus] = useState(null);',
    '  const [uploading, setUploading] = useState(false);\n  const [elapsedTime, setElapsedTime] = useState(0);\n  const [uploadTokenUsage, setUploadTokenUsage] = useState(null);\n  const [apiKeysStatus, setApiKeysStatus] = useState(null);'
)

# 2. Fix handleUpload
old_handle_upload = '''  // Use the custom hook to track extraction time
  const { elapsedTime, isRunning, startTimer, stopTimer, resetTimer } = useElapsedTime();

  const handleUpload = async () => {
    if (!uploadFile) {
      alert("Please select a file to upload.");
      return;
    }

    const groqApiKey = getGlobalApiStatus().groq;
    if (!groqApiKey) {
      alert("Please configure a Groq API Key first.");
      return;
    }

    setUploading(true);
    setUploadResult(null);
    resetTimer();
    setUploadTokenUsage(null);
    startTimer();
    
    try {
      const result = await aiApi.uploadDocument(uploadFile, groqApiKey);
      if (result.success) {
        setUploadResult(result.data);
        setExtractedData(result.data.extracted_data || {});
        if (result.data.api_keys_status?.token_usage) {
            setUploadTokenUsage(result.data.api_keys_status.token_usage);
        }
      } else {}
    } catch (e) {
      console.error(e);
    } finally {
      stopTimer();
      setUploading(false);
    }
  };'''

new_handle_upload = '''  const handleUpload = async () => {
    if (!uploadFile) {
      alert("Please select a file to upload.");
      return;
    }

    const groqApiKey = getGlobalApiStatus().groq;
    if (!groqApiKey) {
      alert("Please configure a Groq API Key first.");
      return;
    }

    setUploading(true);
    setUploadResult(null);
    setElapsedTime(0);
    setUploadTokenUsage(null);
    
    const timerStart = Date.now();
    const timerInterval = setInterval(() => {
      setElapsedTime(((Date.now() - timerStart) / 1000).toFixed(1));
    }, 100);
    
    try {
      const result = await aiApi.uploadDocument(uploadFile, groqApiKey);
      clearInterval(timerInterval);
      setElapsedTime(((Date.now() - timerStart) / 1000).toFixed(1));
      
      if (result.success) {
        setUploadResult(result.data);
        setExtractedData(result.data.extracted_data || {});
        if (result.data.api_keys_status?.token_usage) {
            setUploadTokenUsage(result.data.api_keys_status.token_usage);
        }
      }
    } catch (e) {
      clearInterval(timerInterval);
      setElapsedTime(((Date.now() - timerStart) / 1000).toFixed(1));
      console.error(e);
      alert(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };'''

if old_handle_upload in content:
    content = content.replace(old_handle_upload, new_handle_upload)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed handleUpload and states!")
else:
    print("Could not find handleUpload block to replace")
