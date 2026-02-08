import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { showCustomToast } from "../utils/customToast";
import ThinkingLoader from "./ThinkingLoader";
import { useSearch } from "../context/SearchContext";

export default function SearchResponseContainer({
  content,
  imageURL,
  uniqueId,
  searchResultId,
  setSelectedText
}) {
  const responseContainerRef = useRef(null);
  const selectedTextRef = useRef("")
  const toolbarRef = useRef(null);

  const {
    searchStarted,
    searchInputData,
    imageGenerationStarted
  } = useSearch();

  /* ---------- COPY TO CLIPBOARD ---------- */
  const copyResponseToClipboard = async () => {
    const text =
      selectedTextRef.current ||
      imageURL ||
      responseContainerRef.current?.innerText;

    try {
      await navigator.clipboard.writeText(text);
      showCustomToast("Copied to clipboard!", { type: "success" });
    } catch (err) {
      console.error("Failed to copy response:", err);
    }
  };

  /* ---------- TEXT SELECTION CAPTURE ---------- */
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (
        text &&
        responseContainerRef.current &&
        selection.rangeCount > 0 &&
        responseContainerRef.current.contains(selection.anchorNode)
      ) {
        selectedTextRef.current = text;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (toolbarRef.current) {
          toolbarRef.current.style.display = "flex";
          toolbarRef.current.style.top = `${rect.top + window.scrollY - 50}px`;
          toolbarRef.current.style.left = `${rect.left + rect.width / 2}px`;
        }
      } else {
        selectedTextRef.current = "";
        if (toolbarRef.current) {
          toolbarRef.current.style.display = "none";
        }
      }
    };

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [selectedTextRef]);

  /* ---------- ACTION HANDLERS ---------- */
  const handleAddToFollowUp = () => {
    if (selectedTextRef.current.trim()) {
      setSelectedText(selectedTextRef.current)
      selectedTextRef.current = "";
      if (toolbarRef.current) {
        toolbarRef.current.style.display = "none";
      }
    }
  };

  const handleCheckSources = () => {
    console.log("Check sources:", selectedTextRef.current);
  };

  return (
    <div className="relative bg-white p-6 rounded-lg border border-gray-200 mb-4">

      {/* Floating Selection Toolbar (NO STATE) */}
      {createPortal(
        <div
          ref={toolbarRef}
          style={{
            position: "absolute",
            display: "none",
            transform: "translateX(-50%)",
            zIndex: 9999
          }}
          className="bg-white shadow-lg border border-teal-600 text-teal-600 rounded-md flex overflow-hidden"
        >
          <button
            className="px-3 py-1 text-sm hover:bg-gray-100"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleAddToFollowUp}
          >
            Add to follow-up
          </button>

          {/* <button
            className="px-3 py-1 text-sm hover:bg-gray-100 border-l"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCheckSources}
          >
            Check sources
          </button> */}
        </div>,
        document.body
      )}

      {/* Copy icon */}
      <div className="absolute bottom-0 right-0">
        <button
          type="button"
          onClick={copyResponseToClipboard}
          id={`copy-icon-${uniqueId}`}
          className="p-2 rounded-md cursor-pointer text-xl text-gray-600"
          title="Copy response"
        >
          <i className="far fa-copy" />
        </button>
      </div>

      {/* Thinking Loader */}
      {(searchStarted &&
        searchResultId === searchInputData.search_result_id) ? (
        imageGenerationStarted ? (
          <ThinkingLoader text="Generating..." />
        ) : !content ? (
          <ThinkingLoader text="Thinking..." />
        ) : null
      ) : null}

      {/* Content */}
      {imageURL ? (
        <img
          src={imageURL}
          alt="Generated"
          className="max-w-sm object-cover rounded-md"
        />
      ) : (
        <div
          ref={responseContainerRef}
          id={`response-text-inner-${uniqueId}`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
