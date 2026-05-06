import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

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
     setLoading(false); 
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

  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      if (newData.profileImage !== undefined) localStorage.setItem("profileImage", newData.profileImage);
      if (newData.fullName !== undefined) localStorage.setItem("fullName", newData.fullName);
      return updated;
    });
  };

  const logout = () => {
    localStorage.clear(); 
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);