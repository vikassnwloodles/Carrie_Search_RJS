// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth context
import { useAuth } from "../context/AuthContext";
import { useAuthUtils } from "../utils/useAuthUtils";

/* helper to try parse JSON */
async function tryParseJson(text) {
    try { return text ? JSON.parse(text) : null; }
    catch { return null; }
}

/* POST credentials and return parsed JSON (or raw text) */
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
            (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
            raw ||
            `Login failed (${res.status})`;
        throw new Error(serverMessage);
    }

    return data ?? raw;
}


export default function Login() {
    const { logoutAndNavigate } = useAuthUtils();
    const navigate = useNavigate();
    const usernameRef = useRef(null);

    const { login } = useAuth();

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
            // 1) authenticate
            const result = await loginUser({ username, password });

            // 2) extract token
            const token =
                result?.access ||
                result?.token ||
                result?.access_token ||
                result?.auth_token ||
                null;

            const userInfo = result?.user_info ? JSON.parse(result?.user_info) : result?.user_info

            // 3) subscription fetch (best-effort)
            let isPro = false;

            try {
                const subRes = await fetchSubscriptionStatus(token);

                if (subRes.ok) {
                    const subData = subRes.data;

                    isPro = subData.is_active
                }
            } catch { }

            // 4) update global auth state
            login(token, userInfo, isPro);

            // 5) success + redirect
            toast.success(result?.message || "Logged in successfully!", { autoClose: 1400 });

            setTimeout(() => navigate("/"), 600);
        } catch (err) {
            toast.error(err?.message || "Invalid username or password.");
        } finally {
            setLoading(false);
        }
    }

    /* Query subscription status using token (if available) */
    async function fetchSubscriptionStatus(token) {
        const endpoint = `${import.meta.env.VITE_API_URL}/subscriptions/get-subscription-status/`

        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(endpoint, { method: "GET", headers });

        const raw = await res.text().catch(() => null);
        const data = await tryParseJson(raw);

        if (!res.ok) {
            if (res.status === 401) {
                showCustomToast("Session expired. Please log in again.", { type: "warn" });
                logoutAndNavigate()
            } else {
                return { ok: false, raw, data };
            }
        }

        return { ok: true, data };
    }


    return (
        <div className="bg-white rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.12)] p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>

            <form onSubmit={handleLoginSubmit} aria-label="Login form">
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                        Username/Email
                    </label>
                    <input
                        id="username"
                        name="username"
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
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
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
