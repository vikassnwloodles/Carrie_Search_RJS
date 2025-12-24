import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";

const ProfileModal = ({ profile, setProfile, setProfileModalOpen }) => {

    const [formErrors, setFormErrors] = useState({});
    const [activeTab, setActiveTab] = useState("profile");

    // Capture initial form values to detect if anything changed
    const initialProfileRef = useRef({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
    });

    useEffect(() => {
        initialProfileRef.current = {
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email || "",
            phone: profile.phone || "",
        };
    }, []);

    // Client-side validation (ONLY when submitting)
    const isValidPhone = (value) => {
        if (!value) return false;
        const pattern = /^\+?[0-9]+$/; // Only digits or optional leading +
        return pattern.test(value);
    };

    // Submit handler
    async function handleProfileUpdate(e) {
        e.preventDefault();
        setFormErrors({}); // Clear previous errors

        // Client-side phone validation FIRST
        if (!isValidPhone(profile.phone)) {
            const errMsg = "Mobile phone number can only contain digits and an optional leading '+'.";
            setFormErrors({ phone: [errMsg] });
            return; // do NOT call API
        }

        // No-op check — avoid calling API unnecessarily
        const initial = initialProfileRef.current;
        const unchanged =
            initial.firstName === profile.firstName &&
            initial.lastName === profile.lastName &&
            initial.email === profile.email &&
            initial.phone === profile.phone;

        if (unchanged) {
            toast.info(
                <div>
                    <strong style={{ display: "block" }}>No changes</strong>
                    Nothing to update.
                </div>
            );
            return;
        }

        // Prepare payload
        const payload = {
            first_name: profile.firstName,
            last_name: profile.lastName,
            email: profile.email,
            phone: profile.phone,
        };

        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/user/update-profile/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify(payload),
            });

            // Handle server-side field errors
            if (!resp.ok) {
                if (resp.status === 401) {
                    showCustomToast("Session expired. Please log in again.", { type: "warn" });
                    logoutAndNavigate()
                } else {
                    const errorData = await resp.json();
                    if (typeof errorData === "object") {
                        setFormErrors(errorData);
                        return;
                    }
                    toast.error("An error occurred while updating your profile.");
                    return;
                }
            }

            // Success
            toast.success(
                <div>
                    <strong style={{ display: "block" }}>Profile Updated</strong>
                    Your changes have been saved.
                </div>
            );

            setProfileModalOpen(false);
            setFormErrors({});
        } catch (error) {
            toast.error("Something went wrong.");
        }
    }


    async function handleEmailUpdate(e) {
        alert(profile.email)
        return
        e.preventDefault();
        setFormErrors({}); // Clear previous errors

        // Client-side phone validation FIRST
        if (!isValidPhone(profile.phone)) {
            const errMsg = "Mobile phone number can only contain digits and an optional leading '+'.";
            setFormErrors({ phone: [errMsg] });
            return; // do NOT call API
        }

        // No-op check — avoid calling API unnecessarily
        const initial = initialProfileRef.current;
        const unchanged =
            initial.firstName === profile.firstName &&
            initial.lastName === profile.lastName &&
            initial.email === profile.email &&
            initial.phone === profile.phone;

        if (unchanged) {
            toast.info(
                <div>
                    <strong style={{ display: "block" }}>No changes</strong>
                    Nothing to update.
                </div>
            );
            return;
        }

        // Prepare payload
        const payload = {
            first_name: profile.firstName,
            last_name: profile.lastName,
            email: profile.email,
            phone: profile.phone,
        };

        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/user/update-profile/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify(payload),
            });

            // Handle server-side field errors
            if (!resp.ok) {
                const errorData = await resp.json();
                if (typeof errorData === "object") {
                    setFormErrors(errorData);
                    return;
                }
                toast.error("An error occurred while updating your profile.");
                return;
            }

            // Success
            toast.success(
                <div>
                    <strong style={{ display: "block" }}>Profile Updated</strong>
                    Your changes have been saved.
                </div>
            );

            setProfileModalOpen(false);
            setFormErrors({});
        } catch (error) {
            toast.error("Something went wrong.");
        }
    }


    // On change — DO NOT SANITIZE. Simply update the field.
    function onProfileFieldChange(e) {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));

        // Clear that specific error while typing
        const fieldMap = {
            firstName: "first_name",
            lastName: "last_name",
            email: "email",
            phone: "phone",
        };

        const backendKey = fieldMap[name];
        if (backendKey) {
            setFormErrors((errs) => {
                if (!errs[backendKey]) return errs;
                const newErrs = { ...errs };
                delete newErrs[backendKey];
                return newErrs;
            });
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setProfileModalOpen(false)}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-2xl mx-auto rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]"
            >
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                    Update Profile
                </h2>

                {/* ---------------- TABS ---------------- */}
                <div className="flex border-b border-gray-200 mb-4">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "profile"
                            ? "text-teal-600 border-b-2 border-teal-600"
                            : "text-gray-600 border-b-2 border-transparent hover:text-teal-600"
                            }`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Profile Details
                    </button>

                    <button
                        className={`ml-4 px-4 py-2 text-sm font-medium ${activeTab === "contact"
                            ? "text-teal-600 border-b-2 border-teal-600"
                            : "text-gray-600 border-b-2 border-transparent hover:text-teal-600"
                            }`}
                        onClick={() => setActiveTab("contact")}
                    >
                        Contact Details
                    </button>
                </div>

                {/* ---------------- FORM ---------------- */}
                <form className="space-y-4 text-sm" onSubmit={handleProfileUpdate}>

                    {/* ---------------- TAB CONTENT ---------------- */}

                    {/* ⭐ Tab 1: PROFILE DETAILS */}
                    {activeTab === "profile" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* First Name */}
                                <div className="relative mt-4">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={profile.firstName}
                                        onChange={onProfileFieldChange}
                                        required
                                        className="peer w-full border border-gray-300 px-3 pt-5 pb-2 rounded-md"
                                        placeholder="First Name"
                                    />
                                    <label className="absolute left-3 -top-2.5 px-1 bg-white text-xs text-gray-500">
                                        First Name
                                    </label>
                                    {formErrors.first_name && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {formErrors.first_name[0]}
                                        </p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div className="relative mt-4">
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={profile.lastName}
                                        onChange={onProfileFieldChange}
                                        required
                                        className="peer w-full border border-gray-300 px-3 pt-5 pb-2 rounded-md"
                                        placeholder="Last Name"
                                    />
                                    <label className="absolute left-3 -top-2.5 px-1 bg-white text-xs text-gray-500">
                                        Last Name
                                    </label>
                                    {formErrors.last_name && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {formErrors.last_name[0]}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="text-center pt-2">
                                <button
                                    type="submit"
                                    className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700"
                                >
                                    Update Profile
                                </button>
                            </div>
                        </>

                    )}

                    {/* ⭐ Tab 2: CONTACT DETAILS */}
                    {activeTab === "contact" && (
                        <div className="space-y-6">

                            {/* Email Row */}
                            <div className="flex gap-3 items-end">

                                <div className="relative mt-4">
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={onProfileFieldChange}
                                        required
                                        className="peer w-50% border border-gray-300 px-3 pt-5 pb-2 rounded-md"
                                        placeholder="Email Address"
                                    />
                                    <label className="absolute left-3 -top-2.5 px-1 bg-white text-xs text-gray-500">
                                        Email Address
                                    </label>

                                </div>
                                <button
                                    type="button"
                                    className="h-12 whitespace-nowrap bg-teal-600 text-white px-4 rounded-md hover:bg-teal-700"
                                    onClick={handleEmailUpdate}
                                >
                                    Update Email
                                </button>
                                {formErrors.email && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.email[0]}</p>
                                )}
                            </div>

                            {/* Phone Row */}
                            <div className="flex gap-3 items-end">
                                <div className="relative mt-4">
                                    <input
                                        type="text"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={onProfileFieldChange}
                                        required
                                        className="peer w-50% border border-gray-300 px-3 pt-5 pb-2 rounded-md"
                                        placeholder="Phone Number"
                                    />
                                    <label className="absolute left-3 -top-2.5 px-1 bg-white text-xs text-gray-500">
                                        Phone Number
                                    </label>

                                </div>
                                <button
                                    type="button"
                                    className="h-12 whitespace-nowrap bg-teal-600 text-white px-4 rounded-md hover:bg-teal-700"
                                    onClick={() => console.log("TODO: Trigger Update Phone API")}
                                >
                                    Update Phone
                                </button>
                                {formErrors.phone && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.phone[0]}</p>
                                )}
                            </div>

                        </div>
                    )}

                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
