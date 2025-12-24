import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from "../context/AuthContext";
import ChangePasswordModal from './ChangePasswordModal';
import ProfileModal from './ProfileModal';
import { showCustomToast } from '../utils/customToast';
import { useAuthUtils } from '../utils/useAuthUtils';

const BottomUserProfileSection = () => {
  const { logoutAndNavigate } = useAuthUtils()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loadingManagePlan, setLoadingManagePlan] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false)

  const { isPro } = useAuth()

  const dropdownRef = useRef(null)

  async function handleManagePlanClick() {
    try {
      setLoadingManagePlan(true)
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/stripe-portal/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      const resJson = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate()
        } else {
          showCustomToast(
            "Could not fetch Stripe Customer Portal URL. Please try again.",
            { type: "error", title: "Error fetching data" }
          )
        }
      } else {
        window.location.href = resJson.url;
      }
    } catch (err) {
      console.error(err);
      showCustomToast({ message: "Something went wrong" }, { type: "error" });
    } finally {
      setTimeout(() => {
        setLoadingManagePlan(false)
      }, 300);
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])


  return (
    <div
      id="user-profile-section"
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
      {dropdownOpen &&
        <div
          ref={dropdownRef}
          id="dropdown-menu"
          className={`absolute bottom-16 left-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-50 transform transition-opacity ${dropdownOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            }`}
          role="menu"
        >
          {/* Manage Plan (hidden by original but included) */}
          <button
            onClick={handleManagePlanClick}
            id="manage-plan-link"
            className={`w-full text-left flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm ${isPro ? "" : "hidden"}`}
          >
            <i
              className={
                loadingManagePlan
                  ? "fas fa-spinner fa-spin text-indigo-500"
                  : "fas fa-credit-card text-indigo-500"
              }
            />
            <span>Manage Plan</span>
          </button>

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
      }

      {/* Change Password Modal */}
      {changePasswordModalOpen &&
        <ChangePasswordModal {...{ changePasswordModalOpen, setChangePasswordModalOpen }} />
      }
      {/* Update Profile Modal */}
      {profileModalOpen && (
        <ProfileModal {...{ profileModalOpen, setProfileModalOpen }} />
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

export default BottomUserProfileSection