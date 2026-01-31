// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { showCustomToast } from "../utils/customToast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // user + subscription state
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);

  // Restore auth + subscription from localStorage on refresh
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    // const savedIsPro = localStorage.getItem("isPro");

    async function getSubscriptionStatus() {
      const token = localStorage.getItem('authToken');

      const res = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/get-subscription-status/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      const resJson = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logout()
          navigate("/");
        } else {
          showCustomToast(resJson, { type: "error" })
        }
      } else {
        setIsPro(resJson.is_active)
      }
    }
    if (token) getSubscriptionStatus()

    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (token) {
      setIsAuthenticated(true);
    }

    // if (savedIsPro !== null) {
    //   setIsPro(savedIsPro === "true");
    // }

    if (savedUser !== null) {
      setUser(savedUser);
    }
  }, []);

  // Login: save token + subscription to storage
  function login(token, userData = null, subscription = false) {
    if (token) localStorage.setItem("authToken", token);

    // Persist subscription flag
    localStorage.setItem("isPro", subscription ? "true" : "false");
    localStorage.setItem("user", JSON.stringify(userData));

    setIsAuthenticated(true);

    if (userData) setUser(userData);
    setIsPro(subscription);
  }

  // Logout: clear everything
  function logout() {
    // localStorage.removeItem("authToken");
    // localStorage.removeItem("isPro");
    localStorage.clear();

    setIsAuthenticated(false);
    setUser(null);
    setIsPro(false);
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
