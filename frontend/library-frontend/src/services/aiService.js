
import api from "./api";

export const aiService = {
  async getRecommendations(userId, limit = 6) {
    try {
      const res = await api.get(`/ai/recommend`, {
        params: { userId, limit }
      });
      return res.data;
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      return [];
    }
  },

  async sendMessage(message) {
    try {
      const res = await api.post("/ai/chat", { message });
      return res.data;
    } catch (err) {
      console.error("Error in chat:", err);
      return null;
    }
  },


  async getSimilarBooks(bookId, limit = 6) {
    try {
      const res = await api.get(`/ai/similar/${bookId}`, {
        params: { limit }
      });
      return res.data;
    } catch (err) {
      console.error("Error fetching similar books:", err);
      return [];
    }
  },
};