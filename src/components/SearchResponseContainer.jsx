import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { showCustomToast } from "../utils/customToast";
import ThinkingLoader from "./ThinkingLoader";
import { useSearch } from "../context/SearchContext";
import { fetchWithAuth } from "../api/fetchWithAuth";

export default function SearchResponseContainer({
  content,
  imageURL,
  imageDeleted,
  uniqueId,
  searchResultId,
  setSelectedText,
  docUrl,
  docName
}) {
  const responseContainerRef = useRef(null);
  const selectedTextRef = useRef("")
  const toolbarRef = useRef(null);

  const {
    searchStarted,
    searchInputData,
    imageGenerationStarted,
    fileGenerationStarted
  } = useSearch();

  const showOrb =
    searchStarted &&
    searchResultId === searchInputData.search_result_id &&
    !imageGenerationStarted &&
    !fileGenerationStarted;

  /* ---------- Inline orb at end of streamed text (same line); only when text has started rendering ---------- */
  useLayoutEffect(() => {
    const container = responseContainerRef.current;
    if (!container) return;

    const orbId = `thinking-orb-${uniqueId}`;
    let orb = container.querySelector(`#${orbId}`);
    if (orb) orb.remove();

    if (!showOrb || !content) return;

    const orbSpan = document.createElement("span");
    orbSpan.id = orbId;
    orbSpan.className = "inline-block align-middle ml-0.5";
    orbSpan.setAttribute("aria-hidden", "true");
    orbSpan.innerHTML = `
      <span class="relative inline-block w-3 h-3 align-middle">
        <span class="block w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
        <span class="absolute inset-0 block w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></span>
      </span>
    `;

    const lastChild = container.lastChild;
    if (lastChild && lastChild.nodeType === Node.ELEMENT_NODE) {
      lastChild.appendChild(orbSpan);
    } else {
      container.appendChild(orbSpan);
    }

    return () => {
      container.querySelector(`#${orbId}`)?.remove();
    };
  }, [content, showOrb, uniqueId]);

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


  const handleDownload = async () => {
    const response = await fetchWithAuth(docUrl);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = docName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };



  return (
    <div id={`response-text-${uniqueId}`} className="relative p-6 rounded-lg mb-4">

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

      {/* Content (streaming text flows first, orb follows at the end like ChatGPT) */}
      {imageURL ? (!imageDeleted ? (
        <img
          src={imageURL}
          alt="Generated"
          className="max-w-sm object-cover rounded-md"
        />
      ) :
        (
          <div className="max-w-sm h-48 flex items-center justify-center rounded-md bg-gray-100 text-gray-400">
            Image deleted
          </div>
        )
      ) : docUrl ?
      <>📄&nbsp;
        <button
          onClick={handleDownload}
          className="cursor-pointer text-blue-600 underline"
        >
          {docName}
        </button>
        </>
        : (
          <>
            <div
              ref={responseContainerRef}
              id={`response-text-inner-${uniqueId}`}
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {/* Orb is injected inline at end of text via useLayoutEffect. When no content yet, show loader on its own line. */}
            {searchStarted && searchResultId === searchInputData.search_result_id && !content && (
              <ThinkingLoader text="Thinking..." />
            )}
            {searchStarted && searchResultId === searchInputData.search_result_id && (imageGenerationStarted || fileGenerationStarted) && (
              <ThinkingLoader text={imageGenerationStarted ? "Generating..." : "Generating File..."} />
            )}
          </>
        )}
    </div>
  );
}
