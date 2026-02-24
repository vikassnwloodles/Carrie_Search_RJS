import { useState } from "react"
import { showCustomToast } from "../utils/customToast"
import { fetchWithAuth } from "../api/fetchWithAuth"

const ResetPasswordModal = ({ setShowResetPasswordModal, eventUidb64, eventToken }) => {
    const [btnTxt, setBtnTxt] = useState("Reset Password")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    async function handleResetPassword(e) {
        e.preventDefault()
        try {

            if(newPassword !== confirmPassword){
                showCustomToast("Passwords do not match. Please try again.", {type: "error", title: "Error"})
                return
            }

            setBtnTxt("Resetting...")
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/password-reset-confirm/${eventUidb64}/${eventToken}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ new_password: newPassword })
            });

            const resJson = await res.json();

            if (!res.ok) {
                showCustomToast(resJson, { type: "error" })
            } else {
                showCustomToast(resJson, { type: "success" });
                setShowResetPasswordModal(false)
            }
        } catch (err) {
            console.error(err);
            showCustomToast({ message: "Something went wrong" }, { type: "error" });
        } finally {
            setBtnTxt("Reset Password")
        }
    }

    return (
        <div id="resetPasswordModal"
            // ref={resetPwdModalRef}
            onClick={() => setShowResetPasswordModal(false)}
            className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center visible opacity-100 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
                    <button id="closeResetModal" className="text-gray-500 hover:text-gray-800 text-2xl" onClick={() => setShowResetPasswordModal(false)}>&times;</button>
                </div>

                {/* <!-- Reset Error Alert --> */}
                <div className="reset-error alert hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
                    role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">Failed to reset your password. Try again.</span>
                </div>

                {/* <!-- Reset Success Alert --> */}
                <div className="reset-success hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4"
                    role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline">Your password has been reset successfully.</span>
                </div>

                {/* <!-- Reset Password Form --> */}
                <form id="reset-password-form" onSubmit={handleResetPassword}>
                    <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
                        <input onChange={(e) => setNewPassword(e.target.value)} value={newPassword} id="newPassword" type="password" placeholder="Enter new password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required></input>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm
                            Password</label>
                        <input onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} id="confirmPassword" type="password" placeholder="Confirm new password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required></input>
                    </div>
                    <button type="submit"
                        disabled={btnTxt==="Resetting..."}
                        className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors">
                        {btnTxt}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPasswordModal