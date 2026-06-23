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
   * @returns {Promise<Object>} Processed result
   */
  uploadDocument: async (file, groqApiKey = null) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("save_to_db", "false"); // Just extract data, do not save
      if (groqApiKey) {
        formData.append("groq_api_key", groqApiKey);
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
      return {
        success: false,
        error: handleApiError(error),
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
   * @returns {Promise<Object>}
   */
  sendChatMessage: async (message, sessionId = null, groqApiKey = null) => {
    try {
      const response = await aiApiInstance.post("/ai-agents/chat/", {
        message,
        session_id: sessionId,
        groq_api_key: groqApiKey,
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
};

export default aiApi;
