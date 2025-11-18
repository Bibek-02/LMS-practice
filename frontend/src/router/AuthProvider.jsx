import { useState } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("lms_token") || null;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("lms_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = ({ token, profile }) => {
    const userData = {
      id: profile._id,
      email: profile.email,
      role: profile.role,
      name: profile.name || profile.full_name,
    };

    setToken(token);
    setUser(userData);

    localStorage.setItem("lms_token", token);
    localStorage.setItem("lms_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
