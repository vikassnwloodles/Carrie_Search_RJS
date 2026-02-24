// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api/fetchWithAuth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");

    if (token) {
      setIsAuthenticated(true);
      if (savedUser) setUser(JSON.parse(savedUser));
      getSubscriptionStatus();
    }
  }, []);

  async function getSubscriptionStatus() {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/subscriptions/get-subscription-status/`,
        { method: "GET" }
      );

      if (!res.ok) return;

      const data = await res.json();
      setIsPro(data.is_active);
      localStorage.setItem("isPro", data.is_active ? "true" : "false");
    } catch (err) {
      console.error("Subscription fetch failed:", err);
    }
  }

  function login(token, refToken, userData = null, subscription = false) {
    if (token && refToken) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("refToken", refToken);
    }

    localStorage.setItem("isPro", subscription ? "true" : "false");
    localStorage.setItem("user", JSON.stringify(userData));

    setIsAuthenticated(true);
    setUser(userData);
    setIsPro(subscription);
  }

  function logout() {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setIsPro(false);
    navigate("/");
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isPro,
        login,
        logout,
        setUser,
        setIsPro,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
