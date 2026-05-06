import api from "./api";

export const reportService = {
  // Revenue Reports
  getRevenueStats: async (startDate, endDate) => {
    try {
      const response = await api.post("/reports/revenue", { startDate, endDate });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Users Analytics
  getUsersAnalytics: async (startDate, endDate) => {
    try {
      const response = await api.get("/reports/users-analytics", {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Books Analytics
  getBooksAnalytics: async (startDate, endDate) => {
    try {
      const response = await api.get("/reports/books-analytics", {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Loans Analytics
  getLoansAnalytics: async (startDate, endDate) => {
    try {
      const response = await api.get("/reports/loans-analytics", {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fines Analytics
  getFinesAnalytics: async (startDate, endDate) => {
    try {
      const response = await api.get("/reports/fines-analytics", {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Subscriptions Analytics
  getSubscriptionsAnalytics: async (startDate, endDate) => {
    try {
      const response = await api.get("/reports/subscriptions-analytics", {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export Report
  exportReport: async (startDate, endDate, format) => {
    try {
      const response = await api.post(
        "/reports/export",
        { startDate, endDate, format },
        { responseType: "blob" }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Revenue Chart Data
  getRevenueChart: async (startDate, endDate, period = "month") => {
    try {
      const response = await api.get("/reports/revenue-chart", {
        params: { startDate, endDate, period }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Borrow Trends
  getBorrowTrends: async (startDate, endDate, period = "week") => {
    try {
      const response = await api.get("/reports/borrow-trends", {
        params: { startDate, endDate, period }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Overdue Loaners
  getOverdueLoaners: async (limit = 10) => {
    try {
      const response = await api.get("/reports/overdue-loaners", {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Top Fine Users
  getTopFineUsers: async (limit = 10) => {
    try {
      const response = await api.get("/reports/top-fine-users", {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get User Distribution
  getUserDistribution: async () => {
    try {
      const response = await api.get("/reports/user-distribution");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Subscription Distribution
  getSubscriptionDistribution: async () => {
    try {
      const response = await api.get("/reports/subscription-distribution");
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
