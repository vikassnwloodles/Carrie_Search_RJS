// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../context/AuthContext";
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* helper to try parse JSON safely */
async function tryParseJson(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/* LOGIN SHOULD USE NORMAL FETCH */
async function loginUser({ username, password }) {
  const base = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : "";
  const endpoint = base ? `${base}/login/` : "/api/login";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const raw = await res.text().catch(() => null);
  const data = await tryParseJson(raw);

  if (!res.ok) {
    const serverMessage =
      data?.message ||
      data?.error ||
      data?.detail ||
      raw ||
      `Login failed (${res.status})`;

    throw new Error(serverMessage);
  }

  return data;
}

export default function Login() {
  const navigate = useNavigate();
  const usernameRef = useRef(null);
  const { login, setIsPro } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // 1️⃣ Authenticate
      const result = await loginUser({ username, password });

      const token =
        result?.access ||
        result?.token ||
        result?.access_token ||
        result?.auth_token ||
        null;

      const refToken = result?.refresh || null;

      if (!token || !refToken) {
        throw new Error("Invalid authentication response");
      }

      const userInfo =
        typeof result?.user_info === "string"
          ? JSON.parse(result.user_info)
          : result?.user_info;

      // 2️⃣ Store tokens FIRST
      login(token, refToken, userInfo, false);

      // 3️⃣ Fetch subscription AFTER storing token
      let isPro = false;

      try {
        const subRes = await fetchWithAuth(
          `${import.meta.env.VITE_API_URL}/subscriptions/get-subscription-status/`,
          { method: "GET" }
        );

        if (subRes.ok) {
          const subData = await subRes.json();
          isPro = subData.is_active;
          setIsPro(isPro);
        }
      } catch (err) {
        console.error("Subscription fetch failed:", err);
      }

      // 4️⃣ Update subscription in context
      login(token, refToken, userInfo, isPro);

      toast.success(result?.message || "Logged in successfully!", {
        autoClose: 1400,
      });

      setTimeout(() => navigate("/"), 600);
    } catch (err) {
      toast.error(err?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.12)] p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>

      <form onSubmit={handleLoginSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Username/Email
          </label>
          <input
            ref={usernameRef}
            type="text"
            required
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-600">
        <Link to="/forgot-password" className="text-teal-600 hover:underline">
          Forgot Password?
        </Link>
      </p>
    </div>
  );
}
