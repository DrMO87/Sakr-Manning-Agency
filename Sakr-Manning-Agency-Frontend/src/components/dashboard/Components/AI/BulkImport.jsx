import React, { useState, useRef, useEffect } from "react";
import aiApi from "../../../../services/Dashboard/aiApi";

export default function BulkImport({ scale = 1, isDarkMode = false, t }) {
  const [files, setFiles] = useState([]);
  const [globalRank, setGlobalRank] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [logs, setLogs] = useState([]);
  const fileInputRef = useRef(null);

  // Use refs for state that changes inside the async loop
  const isRunningRef = useRef(isRunning);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isRunningRef.current = isRunning;
    isPausedRef.current = isPaused;
  }, [isRunning, isPaused]);

  const handleFolderSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Filter for docx/pdf only
      const validFiles = Array.from(e.target.files).filter(f => 
        f.name.toLowerCase().endsWith('.pdf') || f.name.toLowerCase().endsWith('.docx')
      );
      setFiles(validFiles);
      setProgress({ current: 0, total: validFiles.length, success: 0, failed: 0 });
      setLogs([{ type: 'info', msg: `Loaded ${validFiles.length} supported files (PDF/DOCX).` }]);
    }
  };

  const addLog = (type, msg) => {
    setLogs(prev => [...prev, { type, msg, time: new Date().toLocaleTimeString() }]);
  };

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const startBulkProcess = async () => {
    if (files.length === 0) {
      alert("Please select a folder with CVs first.");
      return;
    }
    
    setIsRunning(true);
    setIsPaused(false);
    isRunningRef.current = true;
    isPausedRef.current = false;
    addLog('info', 'Starting bulk processing...');
    const aiApiKeysStr = localStorage.getItem("aiApiKeys");
    let aiApiKeys = null;
    try {
        if (aiApiKeysStr) {
            aiApiKeys = JSON.parse(aiApiKeysStr);
        } else {
            const legacyGroq = localStorage.getItem("groqApiKey") || localStorage.getItem("groq_api_key");
            if (legacyGroq) {
                aiApiKeys = { groq: [{ key: legacyGroq, status: "live", reset_time: null }], gemini: "" };
            }
        }
    } catch(e){}

    let successes = progress.success;
    let failures = progress.failed;

    for (let i = progress.current; i < files.length; i++) {
      // Check if user stopped or paused
      if (!isRunningRef.current) {
        addLog('warning', 'Process stopped by user.');
        break;
      }

      while (isPausedRef.current) {
        await wait(1000);
        if (!isRunningRef.current) break;
      }
      if (!isRunningRef.current) break;

      const file = files[i];
      addLog('info', `[${i + 1}/${files.length}] Processing: ${file.name}...`);

      try {
        // Step 1: Upload and Extract
        // Refresh keys right before upload in case settings changed
        const currentKeysStr = localStorage.getItem("aiApiKeys");
        let currentKeys = aiApiKeys;
        if (currentKeysStr) currentKeys = JSON.parse(currentKeysStr);

        const uploadRes = await aiApi.uploadDocument(file, currentKeys);
        
        // Update keys if backend returned new status (BUG 1+9 fix)
        if (uploadRes.success && uploadRes.data?.api_keys_status) {
            localStorage.setItem("aiApiKeys", JSON.stringify(uploadRes.data.api_keys_status));
        } else if (!uploadRes.success) {
            // Check error response for api_keys_status too
            const errData = uploadRes.rawError?.response?.data;
            if (errData?.api_keys_status) {
                localStorage.setItem("aiApiKeys", JSON.stringify(errData.api_keys_status));
            }
        }

        if (!uploadRes.success) {
            addLog('error', `Failed to extract data: ${uploadRes.error}`);
            // Check for explicit rate limit or exhausted message
            if (uploadRes.error && uploadRes.error.toLowerCase().includes("exhausted")) {
                addLog('error', 'All API keys exhausted. Pausing import.');
                setIsPaused(true);
                break;
            }
            continue;
        }
        
        let extractedData = uploadRes.data.extracted_data || {};

        // Step 2: Override Rank if specified
        if (globalRank && globalRank.trim() !== "") {
            if (!extractedData["0_application_meta"]) {
                extractedData["0_application_meta"] = {};
            }
            extractedData["0_application_meta"]["application_for_position_as"] = globalRank.trim();
        }

        // Step 3: Save directly to DB
        const saveRes = await aiApi.saveApplicantData(extractedData, file.name);
        
        if (saveRes && saveRes.success && saveRes.status !== 206) {
          addLog('success', `✅ ${file.name} saved successfully.`);
          successes++;
        } else {
            const warnMsg = saveRes?.data?._upload_meta?.message || "Saved with warnings";
            addLog('warning', `⚠️ ${file.name}: ${warnMsg}`);
            successes++; // It saved, but with warnings
        }

      } catch (err) {
        addLog('error', `❌ ${file.name} Failed: ${err.message}`);
        failures++;
      }

      // Update progress
      setProgress(p => ({ ...p, current: i + 1, success: successes, failed: failures }));

      // Rate limiting: Dynamic delay based on number of available keys
      if (i < files.length - 1 && isRunningRef.current) {
        // Count live Groq keys for dynamic delay
        let liveKeyCount = 1;
        try {
            const latestKeysStr = localStorage.getItem("aiApiKeys");
            if (latestKeysStr) {
                const latestKeys = JSON.parse(latestKeysStr);
                liveKeyCount = (latestKeys.groq || []).filter(k => k.key && k.status === "live").length || 1;
            }
        } catch(e){}
        const delaySeconds = Math.max(5, Math.round(30 / liveKeyCount));
        addLog('info', `Waiting ${delaySeconds}s before next file (${liveKeyCount} live key${liveKeyCount > 1 ? 's' : ''})...`);
        
        // Wait in 1-second chunks so we can interrupt if the user clicks Stop
        for (let s = 0; s < delaySeconds; s++) {
            if (!isRunningRef.current) break;
            while (isPausedRef.current) {
                await wait(1000);
                if (!isRunningRef.current) break;
            }
            await wait(1000);
        }
      }
    }

    if (isRunningRef.current) {
        addLog('success', `🎉 Bulk processing completed!`);
        setIsRunning(false);
    }
  };

  return (
    <div style={{ padding: `${Math.round(20 * scale)}px` }}>
      {/* Configuration Panel */}
      <div style={{
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: `${Math.round(16 * scale)}px`,
        padding: `${Math.round(24 * scale)}px`,
        marginBottom: `${Math.round(24 * scale)}px`
      }}>
        <h2 style={{ fontSize: `${Math.round(20 * scale)}px`, color: t.text, marginTop: 0, marginBottom: `${Math.round(16 * scale)}px` }}>
          Bulk Import Configuration
        </h2>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ display: 'block', color: t.textMuted, fontSize: `${Math.round(13 * scale)}px`, marginBottom: '8px' }}>
                    1. Select Folder (PDF/DOCX)
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="file" 
                        webkitdirectory="true" 
                        directory="true" 
                        multiple 
                        ref={fileInputRef}
                        onChange={handleFolderSelect}
                        style={{ display: 'none' }}
                        disabled={isRunning}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isRunning}
                        style={{
                            padding: '10px 20px',
                            background: t.bg,
                            border: `1px solid ${t.cardBorder}`,
                            color: t.text,
                            borderRadius: '8px',
                            cursor: isRunning ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Browse Folder...
                    </button>
                    <div style={{ alignSelf: 'center', color: t.text, fontSize: '14px' }}>
                        {files.length} files selected
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ display: 'block', color: t.textMuted, fontSize: `${Math.round(13 * scale)}px`, marginBottom: '8px' }}>
                    2. Global Rank Override (Optional)
                </label>
                <input 
                    type="text" 
                    value={globalRank}
                    onChange={e => setGlobalRank(e.target.value)}
                    placeholder="e.g. Master, Chief Officer"
                    disabled={isRunning}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: t.inputBg || 'transparent',
                        border: `1px solid ${t.cardBorder}`,
                        color: t.text,
                        borderRadius: '8px',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            <div>
                {!isRunning ? (
                    <button 
                        onClick={startBulkProcess}
                        disabled={files.length === 0}
                        style={{
                            padding: '12px 30px',
                            background: t.btnGradient || '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: files.length === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            opacity: files.length === 0 ? 0.5 : 1
                        }}
                    >
                        Start Bulk Import
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => setIsPaused(!isPaused)}
                            style={{
                                padding: '12px 20px',
                                background: isPaused ? '#10b981' : '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button 
                            onClick={() => setIsRunning(false)}
                            style={{
                                padding: '12px 20px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Stop
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Progress & Logs Panel */}
      <div style={{
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: `${Math.round(16 * scale)}px`,
        padding: `${Math.round(24 * scale)}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: t.text }}>
                <span>Overall Progress</span>
                <span>{progress.current} / {progress.total} ({(progress.current / (progress.total || 1) * 100).toFixed(1)}%)</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: t.bg, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ 
                    height: '100%', 
                    background: t.btnGradient || '#3b82f6', 
                    width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`,
                    transition: 'width 0.3s ease'
                }} />
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '13px', color: t.textMuted }}>
                <span style={{ color: '#10b981' }}>Success: {progress.success}</span>
                <span style={{ color: '#ef4444' }}>Failed: {progress.failed}</span>
            </div>
        </div>

        <div style={{
            background: t.bg,
            border: `1px solid ${t.cardBorder}`,
            borderRadius: '8px',
            padding: '16px',
            height: '400px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            {logs.length === 0 && <div style={{ color: t.textMuted, fontStyle: 'italic' }}>Logs will appear here...</div>}
            {logs.map((log, idx) => {
                let color = t.text;
                if (log.type === 'error') color = '#ef4444';
                if (log.type === 'success') color = '#10b981';
                if (log.type === 'warning') color = '#f59e0b';
                if (log.type === 'info') color = t.accentColor || '#3b82f6';

                return (
                    <div key={idx} style={{ color }}>
                        <span style={{ color: t.textMuted, marginRight: '10px' }}>[{log.time}]</span>
                        {log.msg}
                    </div>
                );
            })}
            <div style={{ float:"left", clear: "both" }}
                 ref={(el) => { el?.scrollIntoView({ behavior: 'smooth' }); }} />
        </div>
      </div>
    </div>
  );
}
