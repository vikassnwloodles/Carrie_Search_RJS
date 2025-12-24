// src/utils/customToast.js
import React from "react";
import { toast } from "react-toastify";

/* -----------------------------------------------------------
   Pretty formatted toast component
----------------------------------------------------------- */
function PrettyToast({ label, messages, type }) {
  const colors = {
    success: "text-green-700",
    error: "text-red-700",
    warn: "text-yellow-700",
    info: "text-blue-700",
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="font-semibold text-sm flex items-center gap-2">
        <span className={`${colors[type] || colors.error}`}>{label}</span>
      </div>

      {messages.length > 1 ? (
        <ul className="ml-6 list-disc text-sm text-gray-800 leading-relaxed">
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      ) : (
        <div className="list-disc text-sm text-gray-800 leading-relaxed">
          {messages.map((msg, i) => (
            <span key={i}>{msg}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* -----------------------------------------------------------
   Prettify snake_case, dotted fields, etc.
----------------------------------------------------------- */
function prettifyFieldName(field) {
  return String(field)
    .replace(/\./g, " ") // user.email -> user email
    .replace(/_/g, " ") // snake_case -> snake case
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
}

/* -----------------------------------------------------------
   Default label overrides for common Django fields
----------------------------------------------------------- */
const DEFAULT_FIELD_LABELS = {
  new_password: "New Password",
  confirm_new_password: "Confirm Password",
  non_field_errors: "Error",
};

/* -----------------------------------------------------------
   Normalize custom toast time (ms, "5s", {amount:5, unit:"s"}, etc.)
----------------------------------------------------------- */
function normalizeTimeToMs(time) {
  if (time == null) return undefined;

  if (typeof time === "number") return time;

  if (typeof time === "string") {
    const t = time.toLowerCase().trim();
    if (t.endsWith("ms")) return parseInt(t);
    if (t.endsWith("s")) return parseFloat(t) * 1000;

    const num = parseFloat(t);
    if (!isNaN(num)) return num;
  }

  if (typeof time === "object" && time.amount) {
    return time.unit?.toLowerCase().startsWith("s")
      ? time.amount * 1000
      : time.amount;
  }

  return undefined;
}

/* -----------------------------------------------------------
   Main Reusable Function: showCustomToast()
----------------------------------------------------------- */
export function showCustomToast(payload, opts = {}) {
  const {
    type: defaultType = "error",
    title,
    time,
    fieldLabels = {},
    fieldTypes = {},
    toastOptions = {},
  } = opts;

  const autoClose = normalizeTimeToMs(time);
  const labels = { ...DEFAULT_FIELD_LABELS, ...fieldLabels };

  let errorsObj = {};

  /* -----------------------------------------------------------
     🔥 NEW: JSX SUPPORT
  ----------------------------------------------------------- */

  if (!payload) {
    toast.error("An unexpected error occurred.", { autoClose, ...toastOptions });
    return;
  }

  // 👉 Case 1: Single JSX element
  if (React.isValidElement(payload)) {
    const toastFn = toast[defaultType] || toast.error;
    toastFn(payload, { autoClose, ...toastOptions });
    return;
  }

  // 👉 Case 2: Array of JSX elements
  if (Array.isArray(payload) && payload.every((item) => React.isValidElement(item))) {
    const toastFn = toast[defaultType] || toast.error;
    payload.forEach((el) => toastFn(el, { autoClose, ...toastOptions }));
    return;
  }

  /* -----------------------------------------------------------
     Django message styles (strings, arrays, objects)
  ----------------------------------------------------------- */

  if (typeof payload === "string") {
    toast[defaultType](
      // <div>
      //   {title && <strong style={{ display: "block" }}>{title}</strong>}
      //   {payload}
      // </div>, { autoClose, ...toastOptions }
      <PrettyToast
        label={title}
        messages={[String(payload)]}
        type={defaultType}
      />, { autoClose, ...toastOptions }
    );
    return
  } else if (typeof payload === Array.isArray(payload)) {
    errorsObj = { non_field_errors: payload };
  } else if (typeof payload === "object") {
    errorsObj = payload;
  } else {
    toast.error("An unexpected error occurred.", { autoClose, ...toastOptions });
    return;
  }

  /* -----------------------------------------------------------
     Loop through Django error dict
  ----------------------------------------------------------- */
  Object.entries(errorsObj).forEach(([field, msgs]) => {
    const label =
      field === "detail"
        ? defaultType.replace(/\b\w/g, (c) => c.toUpperCase())
        : labels[field] || prettifyFieldName(field);

    const msgArray = Array.isArray(msgs) ? msgs : [msgs];

    // Determine toast type
    const fieldType = fieldTypes[field] || defaultType || "error";
    const toastFn = toast[fieldType] || toast.error;

    msgArray.forEach((message) => {
      toastFn(
        <PrettyToast
          label={label}
          messages={[String(message)]}
          type={fieldType}
        />,
        {
          autoClose,
          ...toastOptions,
        }
      );
    });
  });
}
