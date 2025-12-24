import { useEffect } from "react";

export default function SearchExportOptions({ searchResultId, uniqueId }) {
  useEffect(() => {
    // attachEventHandlers(uniqueId, searchResultId)
  }, [uniqueId, searchResultId]);

  return (
    <div className="absolute bottom-0 left-0 flex space-x-2 text-sm">
      <button
        onClick={() => handleChatExportAsPDF(searchResultId)}
        className="p-2 hover:text-teal-600"
      >
        Export PDF
      </button>

      <button
        onClick={() => handleChatExportAsMarkdown(uniqueId)}
        className="p-2 hover:text-teal-600"
      >
        Markdown
      </button>

      <button
        onClick={() => handleChatExportAsDocx(uniqueId)}
        className="p-2 hover:text-teal-600"
      >
        DOCX
      </button>

      <button
        onClick={() => handleShareChat(searchResultId, uniqueId)}
        className="p-2 hover:text-teal-600"
      >
        Share
      </button>

      <button
        id={`rewrite-btn-${uniqueId}`}
        className="p-2 hover:text-teal-600"
      >
        Rewrite
      </button>
    </div>
  );
}
