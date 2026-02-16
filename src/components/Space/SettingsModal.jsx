import { useEffect } from "react";

export default function SettingsModal({
  isOpen,
  onClose,
  onSave,
  instructions,
  setInstructions,
  includeWeb,
  setIncludeWeb,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            disabled={loading}
            onClick={onClose}
            className="disabled:opacity-60 text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Answer Instructions */}
        <div className="mb-8">
          <h3 className="font-medium mb-1">Answer instructions</h3>
          <p className="text-sm text-gray-500 mb-4">
            Give instructions to Carrie to customize how answers are
            focused and structured.
          </p>

          <textarea
            value={instructions || ""}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Always respond in a formal tone..."
            className="w-full bg-gray-100 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none h-28"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6" />

        {/* Search Settings */}
        <div className="mb-10">
          <h3 className="font-medium mb-1">Search settings</h3>
          <p className="text-sm text-gray-500 mb-4">
            Choose which sources are used by default.
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Include Web by default</p>
              <p className="text-xs text-gray-500">
                Search the web in addition to Space context for all searches
              </p>
            </div>

            {/* Toggle */}
            <button
              disabled={loading}
              onClick={() => setIncludeWeb(!includeWeb)}
              className={`disabled:opacity-60 cursor-pointer relative w-12 h-6 rounded-full transition-colors ${includeWeb ? "bg-teal-600" : "bg-gray-300"
                }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${includeWeb ? "translate-x-6" : ""
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <button
            disabled={loading}
            onClick={onClose}
            className="disabled:opacity-60 cursor-pointer px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={onSave}
            className="disabled:opacity-60 cursor-pointer px-5 py-2 rounded-lg bg-black text-white text-sm hover:opacity-90"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
