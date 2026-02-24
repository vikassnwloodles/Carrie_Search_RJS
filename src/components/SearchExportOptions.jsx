import { useEffect, useState } from "react";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";
import { useFireSearch } from "../hooks/useFireSearch";
import { fetchWithAuth } from "../api/fetchWithAuth";





export default function SearchExportOptions({ searchResultId, uniqueId, response, prompt, threadId }) {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logoutAndNavigate } = useAuthUtils()

  const fireSearch = useFireSearch()

  /* ---------------- EXPORT PDF ---------------- */
  async function handleChatExportAsPDF(searchResultId) {
    const resp = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/download-llm-response/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        searchResultId,
        "format": "pdf"
      })
    })

    const blob = await resp.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "report.pdf"
    document.body.appendChild(a)
    a.click()

    a.remove()
    window.URL.revokeObjectURL(url)
  }


  async function handleChatExportAsMarkdown(searchResultId) {

    const resp = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/download-llm-response/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        searchResultId,
        "format": "markdown"
      })
    })

    const blob = await resp.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "report.md"
    document.body.appendChild(a)
    a.click()

    a.remove()
    window.URL.revokeObjectURL(url)
  }


  async function handleChatExportAsDocx(searchResultId) {

    const resp = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/download-llm-response/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        searchResultId,
        "format": "docx"
      })
    })

    const blob = await resp.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "report.docx"
    document.body.appendChild(a)
    a.click()

    a.remove()
    window.URL.revokeObjectURL(url)
  }

  async function handleShareChat(response_id) {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/make-chat-public/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "search-result-id": response_id
        })
      })

      const resJson = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate()
        } else {
          showCustomToast(resJson, { type: "error" })
        }
      } else {
        const shareUrl = `${window.location.origin}/search/public/${resJson.shared_chat_id}`;

        // Modern clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(shareUrl)
            .then(() => {
              showCustomToast("Shareable link copied successfully", { type: "success" });
            })
            .catch(() => {
              fallbackCopyToClipboard(shareUrl);
            });
        } else {
          // Fallback for older browsers / http
          fallbackCopyToClipboard(shareUrl);
        }
      }
    } catch (err) {
      console.error(err);
      showCustomToast({ message: "Something went wrong" }, { type: "error" });
    }

  }

  /* ----------- Fallback copy method ----------- */
  function fallbackCopyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand("copy");
      showCustomToast("Shareable link copied successfully", { type: "success" });
    } catch (err) {
      showCustomToast("Failed to copy link", "error");
    } finally {
      document.body.removeChild(textarea);
    }
  }


  const handleRewrite = () => {
    fireSearch(prompt, searchResultId, threadId)
  };


  /* ---------------- ATTACH LEGACY HANDLERS ---------------- */
  useEffect(() => {
    // must match legacy behavior
    const t = setTimeout(() => {
      if (typeof attachEventHandlers === "function") {
        attachEventHandlers(uniqueId, searchResultId);
      }
    }, 0);

    return () => clearTimeout(t);
  }, [uniqueId, searchResultId]);

  return (
    <div className="pdf-hide absolute bottom-0 left-0 flex space-x-2 text-sm opacity-100 transition-opacity duration-200">

      {/* ================= EXPORT DROPDOWN ================= */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-1 p-2 h-8 rounded-md text-gray-600 hover:text-teal-600 transition-colors cursor-pointer"
        >
          {/* Export Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <path d="M11.5 21h-4.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v5m-5 6h7m-3 -3l3 3l-3 3" />
          </svg>
          <strong className="font-medium">Export</strong>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            className="absolute bottom-10 left-0 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
            onMouseLeave={() => setDropdownOpen(false)}
          >
            {/* PDF */}
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleChatExportAsPDF(searchResultId);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
            >
              <span className="text-red-500"><i className="fas fa-file-pdf text-red-500"></i></span> PDF
            </button>

            {/* Markdown */}
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleChatExportAsMarkdown(searchResultId);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
            >
              <span className="text-orange-500"><i className="fas fa-file-code text-orange-500"></i></span> Markdown
            </button>

            {/* DOCX */}
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleChatExportAsDocx(searchResultId);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
            >
              <span className="text-blue-500"><i className="fas fa-file-word text-blue-500"></i></span> DOCX
            </button>
          </div>
        )}
      </div>

      {/* ================= SHARE ================= */}
      <div className="relative group">
        <div
          // onClick={() => handleShareChat(response.id)}
          onClick={() => handleShareChat(searchResultId)}
          className="flex items-center gap-1 p-2 h-8 rounded-md text-gray-600 hover:text-teal-600 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 4v4c-6.575 1.028 -9.02 6.788 -10 12c-.037 .206 5.384 -5.962 10 -6v4l8 -7l-8 -7z" />
          </svg>
          <strong className="font-medium">Share</strong>
        </div>

        <div
          id={`share-chat-tooltip-${uniqueId}`}
          className="absolute bottom-full mb-2 right-0 w-max bg-black text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none transition-opacity duration-200"
        >
          Link copied. Paste to share
        </div>
      </div>

      {/* ================= REWRITE ================= */}
      <div className="relative group">
        <div
          onClick={() => handleRewrite()}
          id={`rewrite-btn-${uniqueId}`}
          className="flex items-center gap-1 p-2 h-8 rounded-md text-gray-600 hover:text-teal-600 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
            <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
          </svg>
          <strong className="font-medium">Rewrite</strong>
        </div>
      </div>

    </div>
  );
}
