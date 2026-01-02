import React, { useState } from 'react'
import { showCustomToast } from '../utils/customToast';
import { useAuthUtils } from '../utils/useAuthUtils';

const ChangePasswordModal = ({ changePasswordModalOpen, setChangePasswordModalOpen }) => {
    const { logoutAndNavigate } = useAuthUtils();
    const [changePwdFeedback, setChangePwdFeedback] = useState({ error: false, success: false })
    const [changePwdFields, setChangePwdFields] = useState({
        current_password: "",
        new_password: "",
        confirm_new_password: ""
    });

    function onChangePwdFieldChange(e) {
        const { name, value } = e.target
        setChangePwdFields((prev) => ({ ...prev, [name]: value }))
    }

    async function handleChangePassword(e) {
        e.preventDefault()
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user/change-password/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${localStorage.getItem("authToken")}` },
            body: JSON.stringify(changePwdFields)
        });
        const resJson = await res.json();
        if (!res.ok) {
            if (res.status === 401) {
                showCustomToast("Session expired. Please log in again.", { type: "warn" });
                logoutAndNavigate()
            } else {
                showCustomToast(resJson, { type: "error" })
            }
        } else {
            showCustomToast(resJson, { type: "success" })
            setChangePasswordModalOpen(false)
        }
    }


    return (
        <>
            {changePasswordModalOpen &&
                <div
                    className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md m-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
                            <button
                                onClick={() => setChangePasswordModalOpen(false)}
                                className="text-gray-500 hover:text-gray-800 text-2xl"
                                aria-label="Close change password"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Error / Success alerts */}
                        {changePwdFeedback.error && (
                            <div className="change-error alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline"> Failed to change your password. Please try again.</span>
                            </div>
                        )}

                        {changePwdFeedback.success && (
                            <div className="change-success bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4">
                                <strong className="font-bold">Success!</strong>
                                <span className="block sm:inline"> Your password has been updated successfully.</span>
                            </div>
                        )}

                        <form id="change-password-form" onSubmit={handleChangePassword}>
                            <div className="mb-4">
                                <label htmlFor="currentPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                    Current Password
                                </label>
                                <input
                                    id="currentPassword"
                                    name="current_password"
                                    type="password"
                                    placeholder="Enter current password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                    onChange={onChangePwdFieldChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="newPasswordChange" className="block text-gray-700 text-sm font-bold mb-2">
                                    New Password
                                </label>
                                <input
                                    id="newPasswordChange"
                                    name="new_password"
                                    type="password"
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                    onChange={onChangePwdFieldChange}
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmNewPassword"
                                    name="confirm_new_password"
                                    type="password"
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                    onChange={onChangePwdFieldChange}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                                id="change-password-btn"
                            >
                                Change Password
                            </button>
                        </form>
                    </div>
                </div>
            }
        </>
    )
}

export default ChangePasswordModal