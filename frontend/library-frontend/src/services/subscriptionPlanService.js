import api from "./api";

export const subscriptionPlanService = {
  searchPlans: (params) => api.get("/subscription-plans", { params }),
  getPlanById: (id) => api.get(`/subscription-plans/${id}`),
  createPlan: (data) => api.post("/subscription-plans/admin/create", data),
  updatePlan: (id, data) => api.put(`/subscription-plans/admin/${id}`, data),
  deletePlan: (id) => api.delete(`/subscription-plans/admin/${id}`),
  getAllPlans: () => api.get("/subscription-plans"),
};
