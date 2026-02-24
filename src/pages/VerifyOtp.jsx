// src/pages/VerifyOtp.jsx
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { fetchWithAuth } from "../api/fetchWithAuth";

async function verifyOtp({ username, otp }) {
    const base = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
        : "";
    const endpoint = base ? `${base}/verify-login-otp/` : "/api/verify-login-otp/";

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || data?.detail || "OTP verification failed");
    }

    return data;
}

export default function VerifyOtp() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { login, setIsPro } = useAuth();

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const otpRef = useRef(null);

    const username = state?.username;

    useEffect(() => {
        if (!username) {
            navigate("/login");
        }
        otpRef.current?.focus();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;

        setLoading(true);

        try {
            const result = await verifyOtp({ username, otp });

            const token = result?.access;
            const refToken = result?.refresh;

            const userInfo =
                typeof result?.user_info === "string"
                    ? JSON.parse(result.user_info)
                    : result?.user_info;

            // Store tokens
            login(token, refToken, userInfo, false);

            // Fetch subscription
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

            login(token, refToken, userInfo, isPro);

            toast.success("Login successful!", { autoClose: 1400 });
            // setTimeout(() => navigate("/"), 600);
            setTimeout(() => window.location.href = "/", 600);
        } catch (err) {
            toast.error(err?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.12)] p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Verify OTP</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Enter OTP
                    </label>
                    <input
                        ref={otpRef}
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>
            </form>
        </div>
    );
}