// src/components/SignupForm.jsx
import React, { useState } from "react";
import.meta.env.VITE_API_URL

/**
 * SignupForm
 *
 * Props:
 *  - apiEndpoint (string) optional. Default: process.env.REACT_APP_API_URL + '/signup' or '/api/signup'
 *  - onSuccess (function) optional. Called with server response on successful signup.
 */
export default function SignupForm({ apiEndpoint, onSuccess }) {
  // Read base URL from .env (VITE_API_URL=https://your-backend.com)
  const baseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "") // remove trailing slash
    : "";

  // final endpoint priority:
  // 1. apiEndpoint prop
  // 2. .env base URL + "/signup/"
  // 3. fallback: "/api/signup/"
  const endpoint = apiEndpoint || (baseUrl ? `${baseUrl}/signup/` : "/api/signup/");


  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirm_password: "",
    agreed_to_terms: false,
    consent_to_communications: false,
  });

  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function clientValidate() {
    if (!form.email) return "Email is required.";
    if (!form.username) return "Username is required.";
    if (!form.password) return "Password is required.";
    if (form.password !== form.confirm_password) return "Passwords do not match.";
    if (!form.agreed_to_terms) return "You must agree to the Terms of Service and Privacy Policy.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    const clientError = clientValidate();
    if (clientError) {
      setMessage({ type: "error", text: clientError });
      return;
    }

    setSubmitting(true);

    try {
      // Build payload (exclude confirm_password)
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        username: form.username,
        password: form.password,
        agreed_to_terms: form.agreed_to_terms,
        consent_to_communications: form.consent_to_communications,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        // credentials: "include", // enable if backend uses cookies
      });

      // Read the body text exactly once (no double .json() or .text())
      let rawBody = null;
      try {
        rawBody = await res.text(); // read body once
      } catch (readErr) {
        rawBody = null;
      }

      // Try parse JSON if possible
      let data = null;
      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch (parseErr) {
          // not JSON - that's fine, we'll keep rawBody
          data = null;
        }
      }

      if (!res.ok) {
        // Build a helpful server message
        const serverMessage =
          (data &&
            (data.message ||
              data.error ||
              (data !== null && typeof data === "object" && !Array.isArray(data) ? Object.values(data).flat().join(' ') : null))) ||
          rawBody ||
          `Server returned an error (${res.status})`;

        setMessage({ type: "error", text: serverMessage });
        setSubmitting(false);
        return;
      }

      // Success path
      const successText =
        (data && (data.message || data.success)) ||
        "Registration successful — check your email for confirmation.";

      setMessage({ type: "success", text: successText });
      setSubmitting(false);
      setForm((prev) => ({ ...prev, password: "", confirm_password: "" }));
      if (typeof onSuccess === "function") onSuccess(data);
    } catch (err) {

      // If CORS blocked the request, the fetch will fail early and there won't be a response body.
      // Common symptom: TypeError: Failed to fetch
      setMessage({
        type: "error",
        text: "Failed to fetch"
      });
      setSubmitting(false);
    }

  }

  return (
    <div className="max-w-3xl mx-auto py-10 animate-fade-in px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Carrie Client Sign Up Form</h1>

      <p className="text-lg text-gray-700 leading-relaxed mb-4">
        Why settle for Google when you can get more, give more, and help change lives? Carrie isn’t just about making
        your life easier—it’s about creating opportunity, stability, and hope for unserved and underserved urban and
        rural children and families nationwide.
      </p>

      <form id="signup-form-new" className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
        {/* Personal Information */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first-name">
              First Name:
            </label>
            <input
              id="first-name"
              name="first_name"
              type="text"
              placeholder="John"
              value={form.first_name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last-name">
              Last Name:
            </label>
            <input
              id="last-name"
              name="last_name"
              type="text"
              placeholder="Doe"
              value={form.last_name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            *Email Address:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            value={form.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobile-phone">
            Mobile Phone Number:
          </label>
          <input
            id="mobile-phone"
            name="phone"
            type="tel"
            placeholder="(123) 456-7890"
            value={form.phone}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Account & Access */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Account & Access</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-username">
            *Create a Username:
          </label>
          <input
            id="signup-username"
            name="username"
            type="text"
            required
            placeholder="username"
            value={form.username}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-password">
            *Create a Password:
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            placeholder="******************"
            value={form.password}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
            *Confirm Password:
          </label>
          <input
            id="confirm-password"
            name="confirm_password"
            type="password"
            required
            placeholder="******************"
            value={form.confirm_password}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Consent and Agreement */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Consent and Agreement</h2>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="agreed_to_terms"
              required
              checked={form.agreed_to_terms}
              onChange={handleChange}
              className="form-checkbox text-teal-600 rounded"
            />
            <span className="ml-2 text-gray-700">*I agree to the Terms of Service and Privacy Policy.</span>
          </label>
        </div>

        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="consent_to_communications"
              checked={form.consent_to_communications}
              onChange={handleChange}
              className="form-checkbox text-teal-600 rounded"
            />
            <span className="ml-2 text-gray-700">
              I consent to receive communications (email, text, and automated call) from Essential Families about my
              account and available services.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-center">
          <button
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition-colors"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Registering..." : "Register for Carrie"}
          </button>
        </div>

        {message && (
          <div
            id="signup-message"
            className={`mt-4 p-3 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
            role="status"
            aria-live="polite"
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
