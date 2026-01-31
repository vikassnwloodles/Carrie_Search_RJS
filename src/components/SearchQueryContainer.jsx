import { useEffect, useRef, useState } from "react";
import { showCustomToast } from "../utils/customToast";

export default function SearchQueryContainer({ query, uniqueId, searchResultId, onSearch }) {
  // alert(query)
  const promptContainerRef = useRef(null);

  const [isPromptContainerExpanded, setIsPromptContainerExpanded] = useState(false);
  const [isEditBtnClicked, setIsEditBtnClicked] = useState(false);
  const [editedQuery, setEditedQuery] = useState(query);

  useEffect(() => {
    setEditedQuery(query)
  }, [query])

  useEffect(() => {
    // attachEventHandlers(uniqueId, searchResultId)
  }, [uniqueId, searchResultId]);

  /* ---------- COPY TO CLIPBOARD ---------- */
  const copyPromptToClipboard = async () => {
    if (!promptContainerRef.current) return;

    const text = promptContainerRef.current.innerText;

    try {
      await navigator.clipboard.writeText(text);
      showCustomToast("Copied to clipboard!", { type: "success" });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  /* ---------- EDIT HANDLERS ---------- */
  const handleConfirmEdit = () => {
    setIsEditBtnClicked(false);
    showCustomToast("Prompt updated", { type: "success" });
    const text = promptContainerRef.current.value;
    onSearch(text, searchResultId)
  };

  const handleCancelEdit = () => {
    setEditedQuery(query); // revert changes
    setIsEditBtnClicked(false);
  };

  const withLineBreaks = editedQuery.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

  return (
    <div
      id={`text-container-${uniqueId}`}
      className="w-full border border-gray-200 bg-white rounded-xl pl-4 pt-4 pb-8 pr-2 mb-8 group relative"
    >
      {/* Prompt container */}
      {!isEditBtnClicked ? (
        <div
          ref={promptContainerRef}
          className={`text-container-${uniqueId} relative overflow-hidden transition-all duration-300 text-black leading-relaxed`}
          style={{ maxHeight: isPromptContainerExpanded ? "2000px" : "120px" }}
        >
          <p className="text-base font-medium">
            {withLineBreaks}
          </p>
        </div>
      ) : (
        <textarea
          ref={promptContainerRef}
          value={editedQuery}
          onChange={(e) => setEditedQuery(e.target.value)}
          className="w-full min-h-[120px] resize-none border rounded-md p-2 text-black focus:outline-none"
        />
      )}

      {/* Icons */}
      <div className="pdf-hide absolute bottom-0 right-0 flex space-x-2">
        <IconButton
          onClick={copyPromptToClipboard}
          id={`query-copy-icon-${uniqueId}`}
          icon="far fa-copy"
          title="Copy"
          hidden={isEditBtnClicked}
        />
        {onSearch &&
          <>
            <IconButton
              onClick={() => setIsEditBtnClicked(true)}
              id={`query-edit-icon-${uniqueId}`}
              icon="far fa-edit"
              title="Edit"
              hidden={isEditBtnClicked}
            />

            <IconButton
              onClick={handleConfirmEdit}
              id={`confirm-edit-${uniqueId}`}
              icon="fas fa-check"
              title="Confirm"
              hidden={!isEditBtnClicked}
            />

            <IconButton
              onClick={handleCancelEdit}
              id={`cancel-edit-${uniqueId}`}
              icon="fas fa-times"
              title="Cancel"
              hidden={!isEditBtnClicked}
            />
          </>
        }
      </div>

      {/* Toggle */}
      {!isEditBtnClicked && (
        <button
          onClick={() => setIsPromptContainerExpanded(v => !v)}
          className={`toggle-btn-${uniqueId} absolute bottom-0 text-teal-600 flex items-center gap-1 pdf-hide`}
        >
          <span className={`toggle-text-${uniqueId}`}>
            {isPromptContainerExpanded ? "Show less" : "Show more"}
          </span>
        </button>
      )}
    </div>
  );
}

/* ---------- ICON BUTTON ---------- */
function IconButton({ id, icon, hidden, onClick, ...props }) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`p-2 border rounded-md cursor-pointer ${hidden ? "hidden" : ""}`}
      {...props}
    >
      <i className={icon} />
    </button>
  );
}
