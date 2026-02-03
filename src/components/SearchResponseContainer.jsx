import { useRef } from "react";
import { showCustomToast } from "../utils/customToast";
import ThinkingLoader from "./ThinkingLoader";
import { useSearch } from "../context/SearchContext";

export default function SearchResponseContainer({ content, imageURL, uniqueId, searchResultId }) {
  const responseContainerRef = useRef(null);
  const { searchStarted, searchInputData, streamStarted, imageGenerationStarted } = useSearch()

  /* ---------- COPY TO CLIPBOARD ---------- */
  const copyResponseToClipboard = async () => {
    // if (!responseContainerRef.current) return;

    const text = imageURL || responseContainerRef.current.innerText;

    try {
      await navigator.clipboard.writeText(text);
      showCustomToast("Copied to clipboard!", { type: "success" });
    } catch (err) {
      console.error("Failed to copy response:", err);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4 relative">
      {/* Copy icon */}
      <div className="pdf-hide absolute bottom-0 right-0">
        <button
          type="button"
          onClick={copyResponseToClipboard}
          id={`copy-icon-${uniqueId}`}
          className="p-2 rounded-md cursor-pointer text-xl text-gray-600"
          // className="p-2 border rounded-md cursor-pointer"
          title="Copy response"
        >
          <i className="far fa-copy" />
        </button>
      </div>

      {/* Rendered response */}
      {/* {searchStarted && searchResultId === searchInputData.search_result_id && !streamStarted && <ThinkingLoader />} */}
      {/* {searchStarted && searchResultId === searchInputData.search_result_id && !content && <ThinkingLoader />} */}
      {(searchStarted && searchResultId === searchInputData.search_result_id) ? (imageGenerationStarted ? <ThinkingLoader text={`Generating...`} /> : (!content ? <ThinkingLoader text={`Thinking...`} /> : null)) : null}
      {imageURL ?
        <img src={imageURL} alt="Generated Image" className="max-w-sm object-cover rounded-md" />
        :
        <div
          ref={responseContainerRef}
          id={`response-text-inner-${uniqueId}`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      }
    </div>
  );
}
