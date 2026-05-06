export const getToken = () => localStorage.getItem("token");
export const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });
