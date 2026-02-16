import React, { useEffect, useState } from "react";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";
import { fetchWithAuth } from "../utils/fetchWithAuth";

const ChangePasswordModal = ({
  changePasswordModalOpen,
  setChangePasswordModalOpen,
}) => {
  const { logoutAndNavigate } = useAuthUtils();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changePwdFields, setChangePwdFields] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  /* ---------------- RESET ON CLOSE ---------------- */
  useEffect(() => {
    if (!changePasswordModalOpen) {
      setChangePwdFields({
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });
      setIsSubmitting(false);
    }
  }, [changePasswordModalOpen]);

  /* ---------------- ESC TO CLOSE ---------------- */
  useEffect(() => {
    if (!changePasswordModalOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setChangePasswordModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [changePasswordModalOpen, setChangePasswordModalOpen]);

  function onChangePwdFieldChange(e) {
    const { name, value } = e.target;
    setChangePwdFields((prev) => ({ ...prev, [name]: value }));
  }

  async function handleChangePassword(e) {
    e.preventDefault();

    const { current_password, new_password, confirm_new_password } =
      changePwdFields;

    /* --------- CLIENT SIDE VALIDATION --------- */
    if (new_password !== confirm_new_password) {
      showCustomToast("New passwords do not match.", { type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/user/change-password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(changePwdFields),
        }
      );

      const resJson = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", {
            type: "warn",
          });
          logoutAndNavigate();
        } else {
          showCustomToast(
            resJson?.message || "Failed to change password.",
            { type: "error" }
          );
        }
      } else {
        showCustomToast(
          resJson?.message || "Password updated successfully.",
          { type: "success" }
        );
        setChangePasswordModalOpen(false);
      }
    } catch (err) {
      showCustomToast("Something went wrong. Please try again.", {
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!changePasswordModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      onClick={() => setChangePasswordModalOpen(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Change Password
          </h2>
          <button
            onClick={() => setChangePasswordModalOpen(false)}
            className="text-gray-500 hover:text-gray-800 text-2xl"
            aria-label="Close change password"
          >
            &times;
          </button>
        </div>

        {/* FORM */}
        <form id="change-password-form" onSubmit={handleChangePassword}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Current Password
            </label>
            <input
              name="current_password"
              type="password"
              placeholder="Enter current password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
              onChange={onChangePwdFieldChange}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              New Password
            </label>
            <input
              name="new_password"
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
              onChange={onChangePwdFieldChange}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirm New Password
            </label>
            <input
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
            disabled={isSubmitting}
            className={`w-full font-bold py-3 px-4 rounded-lg transition-colors
              ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }
            `}
          >
            {isSubmitting ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
