import React, { useState } from 'react'
import { showCustomToast } from '../utils/customToast';

const ForgotPassword = () => {
    const [email, setEmail] = useState("")
    const [btnTxt, setBtnTxt] = useState("Send Reset Link")

    async function handleSendResetLink(e) {
        e.preventDefault()
        try {
            setBtnTxt("Sending...")

            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/request-password-reset/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const resJson = await res.json();

            if (!res.ok) {
                if(res.status === 429){
                    showCustomToast(resJson.detail, { type: "info" })
                } else{
                    showCustomToast(resJson, { type: "error" })
                }
            } else {
                showCustomToast(resJson, { type: "success" });
            }
        } catch (err) {
            console.error(err);
            showCustomToast({ message: "Something went wrong" }, { type: "error" });
        } finally {
            setBtnTxt("Send Reset Link")
        }
    }


    return (
        // <!-- Forgot Password Form -->
        <div className="bg-white rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.12)] p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Reset Password</h2>
            {/* <form id="forgot-form" className="hidden"> */}
            <form id="forgot-form" onSubmit={handleSendResetLink}>
                <div className="mb-4">
                    <label htmlFor="resetEmail" className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} id="resetEmail" type="email" placeholder="Enter your email"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required></input>
                </div>
                <button type="submit" id="password-reset-btn"
                    disabled={btnTxt==="Sending..."}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors">
                    {btnTxt}
                </button>
                {/* <!-- <p className="mt-4 text-sm text-center text-gray-600">
                    <a href="#" id="showLogin" className="text-teal-600 hover:underline">Back to Login</a>
                </p> --> */}
            </form>
        </div>
    )
}

export default ForgotPassword