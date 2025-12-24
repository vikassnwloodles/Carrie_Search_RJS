import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext"; // adjust path if needed
import { Link } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import { toast } from "react-toastify";

const BottomUserProfileSection = () => {
    const { isPro } = useAuth();


    // Refs for click-away handling
    const dropdownRef = useRef(null);
    const profileSectionRef = useRef(null);

    // Add missing refs used later to avoid runtime errors
    const changePwdModalRef = useRef(null);

    // UI state
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loadingManagePlan, setLoadingManagePlan] = useState(false);
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

    // Profile fetch state
    const [fetchingProfile, setFetchingProfile] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    // Profile form state (controlled) — start empty, will be populated from API
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // Minimal change-password feedback state & handler stubs so modal renders safely
    const [changePwdFeedback, setChangePwdFeedback] = useState({ error: false, success: false });
    function handleChangePassword(e) {
        e.preventDefault();
        // stub: replace with your actual change-password implementation
        setChangePwdFeedback({ error: false, success: true });
        setTimeout(() => setChangePasswordModalOpen(false), 1000);
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                profileSectionRef.current &&
                !profileSectionRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Fetch profile from API on mount and populate form fields
    useEffect(() => {
        let isMounted = true;
        async function loadProfile() {
            setFetchingProfile(true);
            setFetchError(null);

            try {
                const resp = await fetch(`${import.meta.env.VITE_API_URL}/user/fetch-profile/`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        // Include auth header if your API needs it, e.g.:
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                    },
                    credentials: "same-origin", // adjust if using cookies/session auth
                });

                if (!resp.ok) {
                    if (resp.status === 401) {
                        toast.warn(
                            <div>
                                <strong style={{ display: "block" }}>Session Expired!</strong>
                                Your session has been expired! You are about to log out.
                            </div>)
                        localStorage.clear();
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                }

                const data = await resp.json();

                if (!isMounted) return;

                // Map API fields to our form state keys
                setProfile({
                    firstName: data.first_name || "",
                    lastName: data.last_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                });
            } catch (err) {
                console.error("Error loading profile:", err);
                if (isMounted) {
                    // alert(err.message)
                    console.log(err)

                    setFetchError(err.message || "Unknown error");
                }
            } finally {
                if (isMounted) setFetchingProfile(false);
            }
        }

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, []);


    function handleManagePlanClick(e) {
        e.preventDefault();
        setLoadingManagePlan(true);
        // Simulate a short load and reset (replace with real navigation)
        setTimeout(() => setLoadingManagePlan(false), 1200);
    }

    return (
        <div
            id="user-profile-section"
            ref={profileSectionRef}
            className="relative flex flex-col items-center"
        >
            {/* Profile button */}
            <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="relative flex items-center space-x-2 focus:outline-none"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
            >
                <div
                    id="user_profile_icon"
                    className={`w-10 h-10 rounded-full ring-2 ring-offset-2 ${isPro ? "ring-teal-500" : ""} flex items-center justify-center bg-gray-100 text-gray-600 relative`}
                    aria-hidden
                >
                    <i className="fas fa-user text-lg" />
                    {isPro &&
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 shadow">
                            Pro
                        </span>
                    }
                </div>
                <i className="fas fa-chevron-down text-[10px] text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            <div
                ref={dropdownRef}
                id="dropdown-menu"
                className={`absolute bottom-16 left-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-50 transform transition-opacity ${dropdownOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                    }`}
                role="menu"
            >
                {/* Manage Plan (hidden by original but included) */}
                <a
                    href="#"
                    onClick={handleManagePlanClick}
                    id="manage-plan-link"
                    className={`flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm ${isPro ? "" : "hidden"}`}
                >
                    <i
                        className={
                            loadingManagePlan
                                ? "fas fa-spinner fa-spin text-indigo-500"
                                : "fas fa-credit-card text-indigo-500"
                        }
                    />
                    <span>Manage Plan</span>
                </a>

                {/* Update Profile */}
                <button
                    onClick={() => {
                        setProfileModalOpen(true);
                        setDropdownOpen(false);
                    }}
                    id="update-profile"
                    className="w-full text-left flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                >
                    <i className="fas fa-user-edit text-orange-500" />
                    <span>Update Profile</span>
                </button>

                {/* Change Password */}
                <button
                    onClick={() => {
                        setChangePasswordModalOpen(true);
                        setDropdownOpen(false);
                    }}
                    id="change-password"
                    className="w-full text-left flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                >
                    <i className="fas fa-key text-blue-500" />
                    <span>Change Password</span>
                </button>
            </div>

            {/* Change Password Modal */}
            {changePasswordModalOpen && (
                <div
                    className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        ref={changePwdModalRef}
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
                                    name="currentPassword"
                                    type="password"
                                    placeholder="Enter current password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="newPasswordChange" className="block text-gray-700 text-sm font-bold mb-2">
                                    New Password
                                </label>
                                <input
                                    id="newPasswordChange"
                                    name="newPasswordChange"
                                    type="password"
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
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
            )}

            {/* Update Profile Modal */}
            {profileModalOpen && (
                <ProfileModal {...{ profile, setProfile, setProfileModalOpen }} />
            )}

            {/* Subscription Modal (used earlier as modalOpen) */}
            {subscriptionModalOpen && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => setSubscriptionModalOpen(false)}
                >
                    <div
                        className="bg-white w-full max-w-md mx-auto rounded-xl shadow-xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Subscription</h2>
                        <div className="mb-4">
                            <p className="text-sm text-gray-700 font-medium">Thanks for subscribing to Ask Carrie!</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Explore your new Pro features.
                                <Link
                                    to="/how-carrie-works"
                                    className="how-carrie-works-link text-teal-600 hover:underline ml-1"
                                    onClick={() => setSubscriptionModalOpen(false)}
                                >
                                    Learn more
                                </Link>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setSubscriptionModalOpen(false);
                                    handleManagePlanClick(new Event("click"));
                                }}
                                className="border border-gray-300 text-sm px-4 py-1.5 rounded-md text-gray-700 hover:bg-gray-100"
                            >
                                Manage plan <span className="ml-1">↗</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BottomUserProfileSection;
