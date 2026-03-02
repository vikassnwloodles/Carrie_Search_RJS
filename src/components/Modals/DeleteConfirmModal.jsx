import { useEffect } from "react";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Space",
  message = "Are you sure you want to delete this Space?",
  loading = false,
}) {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 sm:p-8 mx-4 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 pr-2">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg touch-manipulation"
          >
            ×
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-500 mb-8">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-3 min-h-[44px] rounded-lg bg-black text-white text-sm hover:opacity-90 disabled:opacity-60 cursor-pointer touch-manipulation"
          >
            Nevermind
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-3 min-h-[44px] rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60 cursor-pointer touch-manipulation"
          >
            {loading ? "Deleting..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
