import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const isAuthenticated = () => {
    return !!token;
  };

  const getToken = () => {
    return token;
  };

  const login = (userData, authToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  return {
    user,
    token,
    isAuthenticated,
    getToken,
    login,
    logout,
  };
}