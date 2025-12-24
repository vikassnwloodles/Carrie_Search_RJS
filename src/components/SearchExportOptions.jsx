import { useEffect, useState } from "react";


// function handleChatExportAsPDF(searchResultId) {
//   alert(searchResultId)
//   setTimeout(() => {
//     // Code to run after delay
//     const element = document.getElementById(`${searchResultId}`);
//     console.log(element)
//     html2pdf(element, {
//       margin: 10,
//       filename: 'document.pdf',
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
//     });
//   }, 200); // delay in milliseconds (200ms = .2 second)
// }


function sanitizeForPdf(root) {
  // Remove ALL external hrefs
  root.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('http')) {
      a.removeAttribute('href');
      a.style.pointerEvents = 'none';
      a.style.cursor = 'default';
    }
  });

  // Remove favicon images if any slipped in
  root.querySelectorAll('img').forEach(img => {
    if (img.src && img.src.includes('favicon')) {
      img.remove();
    }
  });

  // Hide tooltips / popovers
  root.querySelectorAll('[id^="citation-tooltip"]').forEach(el => {
    el.style.display = 'none';
  });
}



function handleChatExportAsPDF(searchResultId) {
  alert(searchResultId)
  const source = document.getElementById(searchResultId);
  if (!source) return;

  // --- STEP 1: Clone DOM ---
  const clone = source.cloneNode(true);

  // --- STEP 2: Sanitize clone (NO external URLs remain) ---
  sanitizeForPdf(clone);

  // --- STEP 3: Mount clone OFFSCREEN ---
  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-99999px';
  sandbox.style.top = '0';
  sandbox.style.width = source.offsetWidth + 'px';
  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  // --- STEP 4: Render PDF from clone ---
  setTimeout(() => {
    html2pdf()
      .set({
        margin: 10,
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: false,     // IMPORTANT
          allowTaint: true,  // IMPORTANT
          logging: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      })
      .from(clone)
      .save()
      .finally(() => {
        // --- STEP 5: Cleanup ---
        document.body.removeChild(sandbox);
      });
  }, 50);
}



export default function SearchExportOptions({ searchResultId, uniqueId }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    <div className="absolute bottom-0 left-0 flex space-x-2 text-sm opacity-100 transition-opacity duration-200">

      {/* ================= EXPORT DROPDOWN ================= */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-1 p-2 bg-white h-8 rounded-md text-gray-600 hover:text-teal-600 transition-colors cursor-pointer"
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
                handleChatExportAsMarkdown(uniqueId);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
            >
              <span className="text-orange-500"><i className="fas fa-file-code text-orange-500"></i></span> Markdown
            </button>

            {/* DOCX */}
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleChatExportAsDocx(uniqueId);
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
          onClick={() => handleShareChat(searchResultId, uniqueId)}
          className="flex items-center gap-1 p-2 bg-white h-8 rounded-md text-gray-600 hover:text-teal-600 cursor-pointer"
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
          id={`rewrite-btn-${uniqueId}`}
          className="flex items-center gap-1 p-2 bg-white h-8 rounded-md text-gray-600 hover:text-teal-600 cursor-pointer"
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
