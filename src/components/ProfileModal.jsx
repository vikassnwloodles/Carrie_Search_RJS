import React, { useEffect, useRef, useState } from 'react'
import { showCustomToast } from '../utils/customToast';
import { useAuthUtils } from '../utils/useAuthUtils';
import { fetchWithAuth } from '../api/fetchWithAuth';

const ProfileModal = ({ profileModalOpen, setProfileModalOpen }) => {
    const { logoutAndNavigate } = useAuthUtils();

    const [activeTab, setActiveTab] = useState("profile");
    const [disableUpdateProfileBtn, setDisableUpdateProfileBtn] = useState(true)
    const [showEnterOtp, setShowEnterOtp] = useState(false)
    const [phoneBtnTxt, setPhoneBtnTxt] = useState("Update Phone")
    const [emailBtnTxt, setEmailBtnTxt] = useState("Update Email")
    const [disableUpdatePhoneBtn, setDisableUpdatePhoneBtn] = useState(false)
    const [disableUpdateEmailBtn, setDisableUpdateEmailBtn] = useState(false)
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        otp: ""
    })
    const [prevProfile, setPrevProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        isPhoneVerified: false,
        isEmailVerified: false
    })

    const phoneBtnRef = useRef(null);

    useEffect(() => {
        if (prevProfile.phone === profile.phone) {
            if (prevProfile.isPhoneVerified) {
                setPhoneBtnTxt("Phone Verified");
                setDisableUpdatePhoneBtn(true)
            } else {
                setPhoneBtnTxt("Verify Phone");
            }
        } else {
            setPhoneBtnTxt("Update Phone");
            setDisableUpdatePhoneBtn(false)
            setShowEnterOtp(false)
            setProfile((prev) => ({ ...prev, ["otp"]: "" }))
        }
    }, [prevProfile.phone, prevProfile.isPhoneVerified, profile.phone]);

    useEffect(() => {
        if (prevProfile.email === profile.email) {
            if (prevProfile.isEmailVerified) {
                setEmailBtnTxt("Email Verified");
                setDisableUpdateEmailBtn(true)
            } else {
                setPhoneBtnTxt("Verify Phone");
            }
        } else {
            setEmailBtnTxt("Update Email");
            setDisableUpdateEmailBtn(false)
        }
    }, [prevProfile.email, prevProfile.isEmailVerified, profile.email]);

    useEffect(() => {
        async function fetchProfile() {
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/user/fetch-profile/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const resJson = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    showCustomToast("Session expired. Please log in again.", { type: "warn" });
                    logoutAndNavigate()
                } else {
                    showCustomToast(resJson, { type: "error" });
                }
            } else {
                setProfile({
                    firstName: resJson.first_name,
                    lastName: resJson.last_name,
                    email: resJson.email,
                    phone: resJson.phone,
                    otp: ""
                })
                setPrevProfile({
                    firstName: resJson.first_name,
                    lastName: resJson.last_name,
                    email: resJson.email,
                    phone: resJson.phone,
                    isPhoneVerified: resJson.is_phone_verified,
                    isEmailVerified: resJson.is_email_verified,
                })
            }
        }

        fetchProfile();
    }, []);


    function onProfileFieldChange(e) {
        let { name, value } = e.target;

        // Sanitize phone input: allow only + and digits
        if (name === "phone") {
            // Keep only + and digits
            value = value.replace(/[^+\d]/g, "");

            // Enforce single leading +
            if (!value.startsWith("+")) {
                value = "+" + value.replace(/\+/g, "");
            } else {
                value = "+" + value.slice(1).replace(/\+/g, "");
            }

            // Remove leading zero after +
            if (value.length > 1 && value[1] === "0") {
                value = "+" + value.slice(2);
            }

            // Limit digits to backend max (15 digits after +)
            value = value.slice(0, 16); // + + 15 digits
        }
        else if (name === "otp") {
            value = value.replace(/\D/g, "").slice(0, 6);
        } else {
            if (prevProfile[name] === value) {
                setDisableUpdateProfileBtn(true);
            } else {
                setDisableUpdateProfileBtn(false);
            }
        }

        setProfile((prev) => ({ ...prev, [name]: value }));
    }


    async function handleProfileUpdate(e) {
        e.preventDefault()
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/user/update-profile/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ first_name: profile.firstName, last_name: profile.lastName })
        });

        const resJson = await res.json();

        if (!res.ok) {
            if (res.status === 401) {
                showCustomToast("Session expired. Please log in again.", { type: "warn" });
                logoutAndNavigate()
            } else {
                showCustomToast(resJson, { type: "error" });
            }
        } else {
            showCustomToast(
                <div>
                    <strong style={{ display: "block" }}>Profile updated!</strong>
                    Your profile has been updated successfully.
                </div>, { type: "success" }
            )
            setProfileModalOpen(false)
        }
    }

    async function handleEmailUpdate() {
        try {
            const prevEmailBtnTxt = emailBtnTxt
            setEmailBtnTxt("Sending Link...")
            setDisableUpdateEmailBtn(true)
            await new Promise(r => setTimeout(r, 500));  // INTENTIONAL DELAY: This is a common UX trick to make state transitions feel smoother. 
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/send-verification-email/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_email: profile.email })
            });

            const resJson = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    showCustomToast("Session expired. Please log in again.", { type: "warn" });
                    logoutAndNavigate()
                } else {
                    // showCustomToast(
                    //     <div>
                    //         <strong style={{ display: "block" }}>Wait a moment!</strong>
                    //         {resJson.error}
                    //     </div>, { type: "info" });
                    showCustomToast(resJson, { type: "info" })
                    setEmailBtnTxt(prevEmailBtnTxt)
                }
            } else {
                showCustomToast(resJson, { type: "success" });
                setEmailBtnTxt("Resend Link")
            }
        } catch (err) {
            console.error(err);
            showCustomToast({ message: "Something went wrong" }, { type: "error" });
        } finally {
            setDisableUpdateEmailBtn(false)
            // setEmailBtnTxt("Resend Link")
        }
    }

    async function handlePhoneUpdate() {
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/user/update-profile/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone: profile.phone })
        });

        const resJson = await res.json();

        if (!res.ok) {
            if (res.status === 401) {
                showCustomToast("Session expired. Please log in again.", { type: "warn" });
                logoutAndNavigate()
            } else {
                showCustomToast(resJson, { type: "error" });
            }
        } else {
            showCustomToast(
                <div>
                    <strong style={{ display: "block" }}>Phone updated!</strong>
                    Your phone has been updated successfully.
                </div>, { type: "success" }
            )
            setPrevProfile((prev) => ({ ...prev, ["isPhoneVerified"]: false, ["phone"]: profile.phone }))
            setPhoneBtnTxt("Verify Phone");
        }
    }

    async function handlePhoneVerify() {
        try {
            setDisableUpdatePhoneBtn(true)
            setPhoneBtnTxt("Sending OTP...")
            await new Promise(r => setTimeout(r, 500));  // INTENTIONAL DELAY: This is a common UX trick to make state transitions feel smoother. 
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/send-otp/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const resJson = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    showCustomToast("Session expired. Please log in again.", { type: "warn" });
                    logoutAndNavigate()
                } else {
                    showCustomToast(resJson, { type: "error" });
                }
            } else {
                showCustomToast(resJson, { type: "success" });
                setShowEnterOtp(true)
            }
        } catch (err) {
            console.error(err);
            showCustomToast({ message: "Something went wrong" }, { type: "error" });
        } finally {
            setDisableUpdatePhoneBtn(false)
            setPhoneBtnTxt("Resend OTP")
        }
    }

    async function handleEnterOtp() {
        try {
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/verify-otp/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp: profile.otp })
            });

            const resJson = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    showCustomToast("Session expired. Please log in again.", { type: "warn" });
                    logoutAndNavigate()
                } else {
                    showCustomToast(resJson, { type: "error" });
                }
            } else {
                showCustomToast(resJson, { type: "success" });
                setShowEnterOtp(false)
                setPrevProfile((prev) => ({ ...prev, ["isPhoneVerified"]: true }))
                setProfile((prev) => ({ ...prev, ["otp"]: "" }))
            }
        } catch (err) {
            console.error(err);
            showCustomToast({ message: "Something went wrong" }, { type: "error" });
        } finally {

        }
    }


    return (
        <>
            {profileModalOpen &&
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
                                            {/* {formErrors.first_name && (
                                                <p className="text-red-600 text-xs mt-1">
                                                    {formErrors.first_name[0]}
                                                </p>
                                            )} */}
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
                                            {/* {formErrors.last_name && (
                                                <p className="text-red-600 text-xs mt-1">
                                                    {formErrors.last_name[0]}
                                                </p>
                                            )} */}
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="text-center pt-2">
                                        <button
                                            disabled={disableUpdateProfileBtn}
                                            type="submit"
                                            className={`px-6 py-2 rounded-md text-white
                                            ${disableUpdateProfileBtn
                                                    ? "bg-gray-400 cursor-not-allowed opacity-70"
                                                    : "bg-teal-600 hover:bg-teal-700 cursor-pointer"
                                                }
                                            `}
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
                                            disabled={disableUpdateEmailBtn}
                                            type="button"
                                            className={`h-12 whitespace-nowrap text-white px-4 rounded-md 
                                                ${disableUpdateEmailBtn ?
                                                    "bg-gray-400 opacity-70 cursor-not-allowed" :
                                                    "hover:bg-teal-700 bg-teal-600"
                                                }
                                            `}
                                            onClick={handleEmailUpdate}
                                        >
                                            {emailBtnTxt}
                                        </button>
                                        {/* {formErrors.email && (
                                            <p className="text-red-600 text-xs mt-1">{formErrors.email[0]}</p>
                                        )} */}
                                    </div>

                                    {/* Phone Row */}
                                    <div className="flex gap-3 items-end">
                                        <div className="relative mt-4">
                                            <input
                                                type="tel"
                                                inputMode="tel"
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
                                            ref={phoneBtnRef}
                                            disabled={disableUpdatePhoneBtn}
                                            type="button"
                                            className={`h-12 whitespace-nowrap text-white px-4 rounded-md 
                                                ${disableUpdatePhoneBtn ?
                                                    "bg-gray-400 opacity-70 cursor-not-allowed" :
                                                    "hover:bg-teal-700 bg-teal-600"
                                                }
                                            `}
                                            onClick={prevProfile.phone !== profile.phone ? handlePhoneUpdate : handlePhoneVerify}
                                        >
                                            {phoneBtnTxt}
                                        </button>
                                    </div>

                                    {/* Enter OTP Row */}
                                    {showEnterOtp &&
                                        < div className="flex gap-3 items-end">
                                            <div className="relative mt-4">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    name="otp"
                                                    value={profile.otp}
                                                    onChange={onProfileFieldChange}
                                                    required
                                                    className="peer w-50% border border-gray-300 px-3 pt-5 pb-2 rounded-md"
                                                    placeholder="Enter OTP"
                                                />
                                                <label className="absolute left-3 -top-2.5 px-1 bg-white text-xs text-gray-500">
                                                    Enter OTP
                                                </label>

                                            </div>
                                            <button
                                                ref={phoneBtnRef}
                                                disabled={(profile.otp.length < 6)}
                                                type="button"
                                                className={`h-12 whitespace-nowrap text-white px-4 rounded-md 
                                                    ${(profile.otp.length < 6) ?
                                                        "bg-gray-400 opacity-70 cursor-not-allowed" :
                                                        "hover:bg-teal-700 bg-teal-600"
                                                    }
                                                `}
                                                onClick={handleEnterOtp}
                                            >
                                                Enter OTP
                                            </button>

                                        </div>
                                    }

                                </div>
                            )}

                        </form>
                    </div >
                </div >
            }
        </>
    )
}

export default ProfileModal