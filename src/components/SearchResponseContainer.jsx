import { useEffect, useRef } from "react";
import { showCustomToast } from "../utils/customToast";

export default function SearchResponseContainer({ content, uniqueId, searchResultId }) {
  const responseContainerRef = useRef(null);

  useEffect(() => {
    // attachEventHandlers(uniqueId)
  }, [uniqueId]);

  /* ---------- COPY TO CLIPBOARD ---------- */
  const copyResponseToClipboard = async () => {
    if (!responseContainerRef.current) return;

    const text = responseContainerRef.current.innerText;

    try {
      await navigator.clipboard.writeText(text);
      showCustomToast("Copied to clipboard!", {type: "success"});
    } catch (err) {
      console.error("Failed to copy response:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4 relative">
      {/* Copy icon */}
      <div className="absolute bottom-0 right-0">
        <button
          type="button"
          onClick={copyResponseToClipboard}
          id={`copy-icon-${uniqueId}`}
          className="p-2 border rounded-md cursor-pointer"
          title="Copy response"
        >
          <i className="far fa-copy" />
        </button>
      </div>

      {/* Rendered response */}
      <div
        ref={responseContainerRef}
        id={`response-text-inner-${uniqueId}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
