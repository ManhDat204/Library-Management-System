import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const username = sessionStorage.getItem("username");
    const profileImage = sessionStorage.getItem("profileImage");
    const fullName = sessionStorage.getItem("fullName");
    const userId = sessionStorage.getItem("userId"); 

    if (token && role) {
      setUser({ token, role, username, profileImage, fullName, userId });
    }
     setLoading(false); 
  }, []);

  const login = (token, role, username, profileImage, fullName, userId) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", role);
    sessionStorage.setItem("username", username ?? "");
    sessionStorage.setItem("profileImage", profileImage ?? "");
    sessionStorage.setItem("fullName", fullName ?? "");
    sessionStorage.setItem("userId", userId ?? "");
    setUser({ token, role, username, profileImage, fullName,userId });
  };

  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      if (newData.profileImage !== undefined) sessionStorage.setItem("profileImage", newData.profileImage);
      if (newData.fullName !== undefined) sessionStorage.setItem("fullName", newData.fullName);
      return updated;
    });
  };

  const logout = () => {
    sessionStorage.clear(); 
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);