// services/Dashboard/api/aiApi.js - SIMPLIFIED FOR UPLOAD + CHAT ONLY
import axios from "axios";
import { tokenStorage } from "../Auth/tokenStorage.js";
import { handleApiError } from "../Auth/handlers.js";

import config from "../Auth/config.js";

// Extract base URL without /api/ for AI endpoints
const baseUrl = config.API_BASE_URL.replace(/\/api\/?$/, '') || "https://backend.sakrshipping.com";

// Create separate axios instance for AI endpoints
const aiApiInstance = axios.create({
  baseURL: baseUrl,
  timeout: 1500000, // 1500 seconds : 25 minutes
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor
aiApiInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * AI API Service - SIMPLIFIED VERSION
 * Only supports document upload and chat
 */
export const aiApi = {
  // ============================================
  // AI DOCUMENT UPLOAD
  // ============================================

  /**
   * Upload and process document (PDF/DOCX) with AI
   * @param {File} file - Document file
   * @param {Object} aiApiKeys - Object containing groq array and gemini key
   * @returns {Promise<Object>} Processed result
   */
  uploadDocument: async (file, aiApiKeys = null) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("save_to_db", "false"); // Just extract data, do not save
      if (aiApiKeys) {
        formData.append("api_keys_config", JSON.stringify(aiApiKeys));
      }

      const response = await aiApiInstance.post("/ai/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to upload document:", error);
      if (error.response) {
        console.error("Server 400 error data:", error.response.data);
      }
      // Pass the raw error object so the caller can inspect response.data
      return {
        success: false,
        error: handleApiError(error),
        rawError: error
      };
    }
  },

  /**
   * Save extracted and reviewed JSON data to the databases
   * @param {Object} structuredData - The reviewed structured JSON
   * @param {string} fileName - Original file name
   * @returns {Promise<Object>} Save result
   */
  saveApplicantData: async (structuredData, fileName = "manual_upload.pdf") => {
    try {
      const response = await aiApiInstance.post("/ai/save-applicant/", {
        structured_data: structuredData,
        file_name: fileName
      });
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("Failed to save applicant data:", error);
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // ============================================
  // AI CHAT AGENT
  // ============================================

  /**
   * Send message to AI chat agent
   * @param {string} message - User message
   * @param {string} sessionId - Optional session ID
   * @param {Object} aiApiKeys - Optional API keys object
   * @returns {Promise<Object>}
   */
  sendChatMessage: async (message, sessionId = null, aiApiKeys = null) => {
    try {
      const response = await aiApiInstance.post("/ai-agents/chat/", {
        message,
        session_id: sessionId,
        api_keys_config: typeof aiApiKeys === 'string' ? null : aiApiKeys,
        groq_api_key: typeof aiApiKeys === 'string' ? aiApiKeys : null, // Fallback for legacy
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to send chat message:", error);
      return {
        success: false,
        error: handleApiError(error),
        rawError: error
      };
    }
  },

  /**
   * Get chat history for a session
   * @param {string} sessionId
   * @returns {Promise<Array>}
   */
  getChatHistory: async (sessionId) => {
    try {
      const response = await aiApiInstance.get(
        `/ai-agents/chat/history/${sessionId}/`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get chat history:", error);
      return {
        success: false,
        error: handleApiError(error),
        data: [],
      };
    }
  },

  /**
   * Get all chat sessions
   * @returns {Promise<Array>}
   */
  getChatSessions: async () => {
    try {
      const response = await aiApiInstance.get("/ai-agents/chat/sessions/");
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : [],
      };
    } catch (error) {
      console.error("Failed to get chat sessions:", error);
      return {
        success: false,
        error: handleApiError(error),
        data: [],
      };
    }
  },

  /**
   * Check exact API Quota
   * @param {Object} aiApiKeys - The AI API Keys configuration
   * @returns {Promise<Object>} The API response with quota data
   */
  checkQuota: async (aiApiKeys) => {
    try {
      const response = await aiApiInstance.post("/ai/check-quota/", {
        api_keys_config: JSON.stringify(aiApiKeys),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default aiApi;
