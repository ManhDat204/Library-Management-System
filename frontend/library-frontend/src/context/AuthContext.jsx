import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    const profileImage = localStorage.getItem("profileImage");
    const fullName = localStorage.getItem("fullName");
    const userId = localStorage.getItem("userId"); 

    if (token && role) {
      setUser({ token, role, username, profileImage, fullName, userId });
    }
  }, []);

  const login = (token, role, username, profileImage, fullName, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username ?? "");
    localStorage.setItem("profileImage", profileImage ?? "");
    localStorage.setItem("fullName", fullName ?? "");
    localStorage.setItem("userId", userId ?? "");
    setUser({ token, role, username, profileImage, fullName,userId });
  };

  // --- HÀM QUAN TRỌNG NHẤT ĐỂ CẬP NHẬT ẢNH ---
  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      // Cập nhật lại localStorage để khi F5 không bị mất ảnh
      if (newData.profileImage !== undefined) localStorage.setItem("profileImage", newData.profileImage);
      if (newData.fullName !== undefined) localStorage.setItem("fullName", newData.fullName);
      return updated;
    });
  };

  const logout = () => {
    localStorage.clear(); // Xóa hết cho sạch
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);