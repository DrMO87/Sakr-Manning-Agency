import React, { useState, useRef, useEffect } from "react";
import defaultAiApi from "../../../../services/Dashboard/aiApi";
import { ASSETS as DEFAULT_ASSETS } from "../../../../utils/constants";
import { Trash2, Minimize2, Send, Sparkles, Copy, Check, Settings } from "lucide-react";
import AnimatedRobotIcon from "./AnimatedRobotIcon";

const ChatWidget = ({
  scale = 1,
  isFloating = true,
  isDarkMode = false,
  aiApi: aiApiProp,
  ASSETS: ASSETSprop,
}) => {
  const aiApi = aiApiProp || defaultAiApi;
  const ASSETS = ASSETSprop || DEFAULT_ASSETS;

  const [isOpen, setIsOpen] = useState(!isFloating);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState(() => localStorage.getItem("groqApiKey") || "");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("groqApiKey", groqApiKey);
  }, [groqApiKey]);

  // Theme tokens
  const t = isDarkMode
    ? {
        panelBg: "rgba(10, 15, 30, 0.85)",
        panelBorder: "rgba(0, 242, 254, 0.15)",
        panelShadow: "0 25px 50px rgba(0,0,0,0.5)",
        headerBg: "rgba(0, 0, 0, 0.4)",
        headerBorder: "rgba(0, 242, 254, 0.1)",
        headerTitle: "#00f2fe",
        headerTitleShadow: "0 0 10px rgba(0,242,254,0.4)",
        statusOnline: "#10b981",
        statusTyping: "#facc15",
        statusText: "#94a3b8",
        messageBg: "transparent",
        userBubbleBg: "linear-gradient(135deg, rgba(0,101,175,0.4) 0%, rgba(37,84,142,0.6) 100%)",
        userBubbleBorder: "1px solid rgba(0,242,254,0.2)",
        userBubbleText: "#fff",
        userBubbleShadow: "0 4px 15px rgba(0,242,254,0.12)",
        aiBubbleBg: "rgba(30, 41, 59, 0.8)",
        aiBubbleBorder: "1px solid rgba(255,255,255,0.05)",
        aiBubbleText: "#e2e8f0",
        aiBubbleShadow: "0 4px 10px rgba(0,0,0,0.2)",
        timestampColor: "#64748b",
        inputBg: "rgba(15, 23, 42, 0.6)",
        inputBorder: "rgba(0, 242, 254, 0.2)",
        inputBorderFocus: "#00f2fe",
        inputText: "#fff",
        inputPlaceholder: "#475569",
        inputAreaBg: "rgba(0, 0, 0, 0.3)",
        inputAreaBorder: "rgba(255, 255, 255, 0.05)",
        sendBtnBg: "linear-gradient(135deg, #0065AF 0%, #25548E 100%)",
        sendBtnColor: "#fff",
        sendBtnShadow: "0 0 15px rgba(0,101,175,0.4)",
        quickBg: "rgba(15, 23, 42, 0.6)",
        quickBorder: "rgba(255,255,255,0.05)",
        quickText: "#cbd5e1",
        quickHoverBg: "rgba(0,242,254,0.08)",
        quickHoverBorder: "rgba(0,242,254,0.3)",
        quickLabel: "#00f2fe",
        errorBg: "rgba(220, 38, 38, 0.1)",
        errorBorder: "rgba(220, 38, 38, 0.4)",
        errorText: "#f87171",
        copyBg: "rgba(0,0,0,0.3)",
        copyBorder: "rgba(255,255,255,0.1)",
        copyText: "#94a3b8",
        btnHoverBg: "rgba(255,255,255,0.1)",
        topAccent: "linear-gradient(90deg, transparent, #00f2fe, transparent)",
        scrollThumb: "rgba(0,242,254,0.15)",
        scrollThumbHover: "rgba(0,242,254,0.3)",
      }
    : {
        panelBg: "rgba(255, 255, 255, 0.95)",
        panelBorder: "rgba(0, 101, 175, 0.08)",
        panelShadow: "0 8px 32px rgba(0,0,0,0.08)",
        headerBg: "linear-gradient(135deg, #0065AF 0%, #25548E 100%)",
        headerBorder: "transparent",
        headerTitle: "#ffffff",
        headerTitleShadow: "none",
        statusOnline: "#10b981",
        statusTyping: "#FCD34D",
        statusText: "rgba(255,255,255,0.85)",
        messageBg: "linear-gradient(180deg,#F9FAFB 0%,#F3F4F6 100%)",
        userBubbleBg: "linear-gradient(135deg, #0065AF 0%, #25548E 100%)",
        userBubbleBorder: "none",
        userBubbleText: "#fff",
        userBubbleShadow: "0 6px 18px rgba(0,101,175,0.18)",
        aiBubbleBg: "#ffffff",
        aiBubbleBorder: "1px solid rgba(0,0,0,0.06)",
        aiBubbleText: "#111827",
        aiBubbleShadow: "0 2px 8px rgba(0,0,0,0.06)",
        timestampColor: "#9CA3AF",
        inputBg: "#F9FAFB",
        inputBorder: "#E5E7EB",
        inputBorderFocus: "#0065AF",
        inputText: "#111827",
        inputPlaceholder: "#9CA3AF",
        inputAreaBg: "#ffffff",
        inputAreaBorder: "#E5E7EB",
        sendBtnBg: "linear-gradient(135deg, #0065AF 0%, #25548E 100%)",
        sendBtnColor: "#fff",
        sendBtnShadow: "0 4px 12px rgba(0,101,175,0.2)",
        quickBg: "#ffffff",
        quickBorder: "#E5E7EB",
        quickText: "#374151",
        quickHoverBg: "#F9FAFB",
        quickHoverBorder: "#0065AF",
        quickLabel: "#6B7280",
        errorBg: "#FEF2F2",
        errorBorder: "#FCA5A5",
        errorText: "#B91C1C",
        copyBg: "rgba(0,0,0,0.04)",
        copyBorder: "rgba(0,0,0,0.08)",
        copyText: "#6B7280",
        btnHoverBg: "rgba(255,255,255,0.2)",
        topAccent: "linear-gradient(90deg, transparent, #0065AF, transparent)",
        scrollThumb: "rgba(0,101,175,0.18)",
        scrollThumbHover: "rgba(0,101,175,0.36)",
      };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Hello! I'm your AI assistant. I can help you with:\n\n• Finding seafarers by rank or certificate\n• Getting statistics and reports\n• Vessel and crew information\n• Interview scheduling\n• Principal details\n\nWhat would you like to know?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setError(null);

    let currentKeys = null;
    try {
        const keysStr = localStorage.getItem("aiApiKeys");
        if (keysStr) {
            currentKeys = JSON.parse(keysStr);
        }
    } catch (e) {}

    try {
      const response = await aiApi.sendChatMessage(userMessage.content, currentSession, currentKeys || groqApiKey);

      if (response.success) {
        setCurrentSession(response.data.session_id);
        const assistantMessage = {
          role: "assistant",
          content: response.data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        if (response.data.api_keys_status) {
            localStorage.setItem("aiApiKeys", JSON.stringify(response.data.api_keys_status));
            window.dispatchEvent(new Event("storage"));
        }
      } else {
        setError(response.error || "Failed to send message");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (query) => {
    setInputMessage(query);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClearChat = () => {
    if (window.confirm("Clear all messages?")) {
      setMessages([]);
      setCurrentSession(null);
      setError(null);
    }
  };

  const handleCopyMessage = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Floating widget button — circular
  if (isFloating && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="chat-widget-fab"
        style={{
          width: `${Math.round(64 * scale)}px`,
          height: `${Math.round(64 * scale)}px`,
          position: "fixed",
          bottom: `${Math.round(30 * scale)}px`,
          right: `${Math.round(30 * scale)}px`,
          borderRadius: "50%",
          background: isDarkMode
            ? "linear-gradient(135deg, rgba(0,101,175,0.8) 0%, rgba(37,84,142,0.9) 100%)"
            : "linear-gradient(135deg, #0065AF 0%, #25548E 100%)",
          border: isDarkMode ? "2px solid rgba(0,242,254,0.4)" : "3px solid #fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 998,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isDarkMode
            ? "0 0 20px rgba(0,242,254,0.3)"
            : "0 8px 30px rgba(0,101,175,0.35)",
          overflow: "hidden",
          padding: 0,
        }}
      >
        <AnimatedRobotIcon size={Math.round(36 * scale)} state="idle" isDark={true} />
        <style>{`
          .chat-widget-fab:hover { transform: scale(1.1); }
          .chat-widget-fab:active { transform: scale(0.95); }
        `}</style>
      </button>
    );
  }

  // ─── RECTANGULAR CHAT CONTAINER ───
  const chatContainerStyle = isFloating
    ? {
        position: "fixed",
        bottom: `${Math.round(30 * scale)}px`,
        right: `${Math.round(30 * scale)}px`,
        width: `${Math.round(400 * scale)}px`,
        height: `${Math.round(600 * scale)}px`,
        zIndex: 999,
      }
    : {
        width: "100%",
        height: "100%",
        maxWidth: `${Math.round(1400 * scale)}px`,
        margin: "0 auto",
      };

  const quickActions = [
    "Find all seafarers with Master rank",
    "Show upcoming interviews this week",
    "List all active companies",
    "Get statistics for this month",
  ];

  // Robot state based on typing
  const robotState = isTyping ? "thinking" : "online";

  return (
    <div style={chatContainerStyle}>
      <div
        className="chat-container"
        style={{
          background: t.panelBg,
          backdropFilter: "blur(24px)",
          borderRadius: `${Math.round(24 * scale)}px`,
          boxShadow: t.panelShadow,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          border: `1.5px solid ${t.panelBorder}`,
          transition: "all 0.4s ease",
        }}
      >
        {/* Top Accent Line */}
        <div
          style={{
            height: "2px",
            width: "100%",
            background: t.topAccent,
            flexShrink: 0,
          }}
        />

        {/* Header */}
        <div
          className="chat-header"
          style={{
            background: t.headerBg,
            borderBottom: `1px solid ${t.headerBorder}`,
            color: "white",
            padding: `${Math.round(14 * scale)}px ${Math.round(20 * scale)}px`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: `${Math.round(12 * scale)}px`,
            }}
          >
            {/* Animated Robot Icon */}
            <div
              style={{
                width: `${Math.round(44 * scale)}px`,
                height: `${Math.round(44 * scale)}px`,
                borderRadius: "50%",
                background: isDarkMode ? "rgba(0,242,254,0.08)" : "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: isDarkMode ? "1px solid rgba(0,242,254,0.2)" : "2px solid rgba(255,255,255,0.2)",
              }}
            >
              <AnimatedRobotIcon
                size={Math.round(30 * scale)}
                state={robotState}
                isDark={isDarkMode || !isDarkMode /* always light colors on dark header in light mode */}
              />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: `${Math.round(16 * scale)}px`,
                  fontWeight: 700,
                  color: t.headerTitle,
                  textShadow: t.headerTitleShadow,
                  letterSpacing: "0.5px",
                }}
              >
                AI Assistant
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: `${Math.round(6 * scale)}px`,
                  marginTop: `${Math.round(3 * scale)}px`,
                }}
              >
                <div
                  className="pulse-dot"
                  style={{
                    width: `${Math.round(7 * scale)}px`,
                    height: `${Math.round(7 * scale)}px`,
                    borderRadius: "50%",
                    backgroundColor: isTyping ? t.statusTyping : t.statusOnline,
                    boxShadow: `0 0 6px ${isTyping ? t.statusTyping : t.statusOnline}`,
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: `${Math.round(11 * scale)}px`,
                    color: t.statusText,
                    fontWeight: 500,
                  }}
                >
                  {isTyping ? "Thinking..." : "Online"}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: `${Math.round(8 * scale)}px` }}>
            <button
              onClick={handleClearChat}
              className="header-btn"
              title="Clear Chat"
              style={{
                background: "transparent",
                border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)"}`,
                color: isDarkMode ? t.textMuted : "#ffffff",
                borderRadius: `${Math.round(8 * scale)}px`,
                width: `${Math.round(34 * scale)}px`,
                height: `${Math.round(34 * scale)}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = isDarkMode ? "rgba(220, 38, 38, 0.15)" : "rgba(220, 38, 38, 0.8)";
                e.currentTarget.style.color = isDarkMode ? "#f87171" : "#ffffff";
                e.currentTarget.style.borderColor = "transparent";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = isDarkMode ? t.textMuted : "#ffffff";
                e.currentTarget.style.border = `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)"}`;
              }}
            >
              <Trash2 size={Math.round(16 * scale)} strokeWidth={2} />
            </button>
            {isFloating && (
              <button
                onClick={() => setIsOpen(false)}
                className="header-btn"
                title="Minimize"
                style={{
                  background: "transparent",
                  border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)"}`,
                  color: isDarkMode ? "#94a3b8" : "#ffffff",
                  borderRadius: `${Math.round(8 * scale)}px`,
                  width: `${Math.round(34 * scale)}px`,
                  height: `${Math.round(34 * scale)}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.3)";
                  e.currentTarget.style.color = isDarkMode ? "#fff" : "#ffffff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = isDarkMode ? "#94a3b8" : "#ffffff";
                }}
              >
                <Minimize2 size={Math.round(16 * scale)} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="messages-container"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: `${Math.round(20 * scale)}px`,
            background: t.messageBg,
            display: "flex",
            flexDirection: "column",
            gap: `${Math.round(16 * scale)}px`,
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className="message-wrapper"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                animation: "slideIn 0.28s ease-out",
              }}
            >
              {/* AI message with robot icon */}
              {msg.role === "assistant" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: `${Math.round(10 * scale)}px`,
                    maxWidth: "88%",
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: "4px" }}>
                    <AnimatedRobotIcon
                      size={Math.round(28 * scale)}
                      state="online"
                      isDark={isDarkMode}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      className="message-bubble"
                      style={{
                        padding: `${Math.round(12 * scale)}px ${Math.round(16 * scale)}px`,
                        borderRadius: `${Math.round(4 * scale)}px ${Math.round(14 * scale)}px ${Math.round(14 * scale)}px ${Math.round(14 * scale)}px`,
                        background: t.aiBubbleBg,
                        color: t.aiBubbleText,
                        fontSize: `${Math.round(14 * scale)}px`,
                        lineHeight: 1.6,
                        boxShadow: t.aiBubbleShadow,
                        position: "relative",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        border: t.aiBubbleBorder,
                      }}
                    >
                      {msg.content}
                      <button
                        onClick={() => handleCopyMessage(msg.content, idx)}
                        className="copy-btn"
                        title="Copy"
                        style={{
                          position: "absolute",
                          top: `${Math.round(8 * scale)}px`,
                          right: `${Math.round(8 * scale)}px`,
                          background: t.copyBg,
                          border: `1px solid ${t.copyBorder}`,
                          borderRadius: `${Math.round(6 * scale)}px`,
                          padding: `${Math.round(3 * scale)}px ${Math.round(7 * scale)}px`,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: `${Math.round(5 * scale)}px`,
                          fontSize: `${Math.round(10 * scale)}px`,
                          color: t.copyText,
                          transition: "all 0.2s",
                        }}
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check size={Math.round(11 * scale)} color="#10b981" />{" "}
                            <span style={{ color: "#10b981" }}>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={Math.round(11 * scale)} /> <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div
                      style={{
                        fontSize: `${Math.round(10 * scale)}px`,
                        color: t.timestampColor,
                        marginTop: `${Math.round(5 * scale)}px`,
                        paddingLeft: `${Math.round(4 * scale)}px`,
                        fontWeight: 500,
                      }}
                    >
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              )}

              {/* User message */}
              {msg.role === "user" && (
                <div style={{ maxWidth: "80%" }}>
                  <div
                    className="message-bubble"
                    style={{
                      padding: `${Math.round(12 * scale)}px ${Math.round(16 * scale)}px`,
                      borderRadius: `${Math.round(14 * scale)}px ${Math.round(14 * scale)}px ${Math.round(4 * scale)}px ${Math.round(14 * scale)}px`,
                      background: t.userBubbleBg,
                      color: t.userBubbleText,
                      fontSize: `${Math.round(14 * scale)}px`,
                      lineHeight: 1.6,
                      boxShadow: t.userBubbleShadow,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      border: t.userBubbleBorder,
                    }}
                  >
                    {msg.content}
                  </div>
                  <div
                    style={{
                      fontSize: `${Math.round(10 * scale)}px`,
                      color: t.timestampColor,
                      marginTop: `${Math.round(5 * scale)}px`,
                      textAlign: "right",
                      paddingRight: `${Math.round(4 * scale)}px`,
                      fontWeight: 500,
                    }}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator with thinking robot */}
          {isTyping && (
            <div
              className="typing-indicator"
              style={{
                display: "flex",
                alignItems: "center",
                gap: `${Math.round(10 * scale)}px`,
                animation: "slideIn 0.28s ease-out",
              }}
            >
              <AnimatedRobotIcon
                size={Math.round(28 * scale)}
                state="thinking"
                isDark={isDarkMode}
              />
              <div
                style={{
                  padding: `${Math.round(10 * scale)}px ${Math.round(16 * scale)}px`,
                  borderRadius: `${Math.round(12 * scale)}px`,
                  background: t.aiBubbleBg,
                  boxShadow: t.aiBubbleShadow,
                  border: t.aiBubbleBorder,
                  display: "flex",
                  gap: `${Math.round(6 * scale)}px`,
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="typing-dot"
                    style={{
                      width: `${Math.round(7 * scale)}px`,
                      height: `${Math.round(7 * scale)}px`,
                      borderRadius: "50%",
                      backgroundColor: isDarkMode ? "#00f2fe" : "#0065AF",
                      opacity: 0.7,
                      animationDelay: `${i * 0.14}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                background: t.errorBg,
                border: `1px solid ${t.errorBorder}`,
                borderRadius: `${Math.round(12 * scale)}px`,
                padding: `${Math.round(12 * scale)}px`,
                color: t.errorText,
                fontSize: `${Math.round(13 * scale)}px`,
                textAlign: "center",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Quick actions */}
          {messages.length <= 1 && !isTyping && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: `${Math.round(10 * scale)}px`,
                marginTop: `${Math.round(8 * scale)}px`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: `${Math.round(8 * scale)}px`,
                  fontSize: `${Math.round(12 * scale)}px`,
                  color: t.quickLabel,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <Sparkles size={Math.round(14 * scale)} /> Try asking:
              </div>
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action)}
                  className="quick-action-btn"
                  style={{
                    background: t.quickBg,
                    border: `1px solid ${t.quickBorder}`,
                    borderRadius: `${Math.round(12 * scale)}px`,
                    padding: `${Math.round(11 * scale)}px ${Math.round(16 * scale)}px`,
                    fontSize: `${Math.round(13 * scale)}px`,
                    color: t.quickText,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.18s",
                    fontWeight: 500,
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: `${Math.round(14 * scale)}px ${Math.round(18 * scale)}px`,
            background: t.inputAreaBg,
            borderTop: `1px solid ${t.inputAreaBorder}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: `${Math.round(12 * scale)}px`,
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isTyping}
                style={{
                  width: "100%",
                  padding: `${Math.round(12 * scale)}px ${Math.round(14 * scale)}px`,
                  border: `2px solid ${t.inputBorder}`,
                  borderRadius: `${Math.round(12 * scale)}px`,
                  fontSize: `${Math.round(14 * scale)}px`,
                  resize: "none",
                  minHeight: `${Math.round(48 * scale)}px`,
                  maxHeight: `${Math.round(120 * scale)}px`,
                  background: t.inputBg,
                  color: t.inputText,
                  transition: "all 0.2s",
                  outline: "none",
                }}
                rows={1}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120 * scale) + "px";
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = t.inputBorderFocus;
                  if (!isDarkMode) e.target.style.backgroundColor = "white";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = t.inputBorder;
                  if (!isDarkMode) e.target.style.backgroundColor = t.inputBg;
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isTyping}
              className="send-btn"
              style={{
                background:
                  inputMessage.trim() && !isTyping
                    ? t.sendBtnBg
                    : (isDarkMode ? "rgba(255,255,255,0.08)" : "#E5E7EB"),
                color:
                  inputMessage.trim() && !isTyping
                    ? t.sendBtnColor
                    : (isDarkMode ? "#475569" : "#9CA3AF"),
                border: "none",
                borderRadius: `${Math.round(12 * scale)}px`,
                padding: `${Math.round(12 * scale)}px ${Math.round(18 * scale)}px`,
                cursor:
                  inputMessage.trim() && !isTyping ? "pointer" : "not-allowed",
                minWidth: `${Math.round(52 * scale)}px`,
                height: `${Math.round(48 * scale)}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: inputMessage.trim() && !isTyping ? t.sendBtnShadow : "none",
              }}
            >
              <Send size={Math.round(18 * scale)} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%,80%,100%{ transform: scale(0);} 40%{ transform: scale(1);} }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .message-wrapper { animation: slideIn 0.28s cubic-bezier(0.4,0,0.2,1); }
        .pulse-dot { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        .typing-dot { animation: bounce 1.4s infinite ease-in-out; }
        .header-btn { cursor: pointer; }
        .header-btn:hover { background: ${t.btnHoverBg} !important; color: #fff !important; }
        .copy-btn:hover { opacity: 0.9; }
        .quick-action-btn:hover { background: ${t.quickHoverBg} !important; border-color: ${t.quickHoverBorder} !important; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .send-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .messages-container::-webkit-scrollbar { width: 6px; }
        .messages-container::-webkit-scrollbar-track { background: transparent; }
        .messages-container::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
        .messages-container::-webkit-scrollbar-thumb:hover { background: ${t.scrollThumbHover}; }
        textarea::placeholder { color: ${t.inputPlaceholder}; }
      `}</style>
    </div>
  );
};

export default ChatWidget;
