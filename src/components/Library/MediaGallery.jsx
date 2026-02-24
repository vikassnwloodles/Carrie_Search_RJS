import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SearchForm from "../SearchForm";

export default function MediaGallery({ media, onDeleteMedia }) {
  const [preview, setPreview] = useState(null);
  const [previewImageFile, setPreviewImageFile] = useState(null);
  const [previewFormKey, setPreviewFormKey] = useState(0);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpImageFile, setFollowUpImageFile] = useState(null);
  const [followUpFormKey, setFollowUpFormKey] = useState(0);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menuRef = React.useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuIndex !== null && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuIndex]);

  async function handleAskFollowUp(imageUrl) {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], "image.png", { type: blob.type || "image/png" });
      setFollowUpImageFile(file);
      setShowFollowUpForm(true);
      setFollowUpFormKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to attach image for follow-up:", err);
      setShowFollowUpForm(true);
      setFollowUpFormKey((k) => k + 1);
    }
  }

  // Close preview using ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setPreview(null);
        setPreviewImageFile(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // When preview opens, fetch image and create File for SearchForm (hidden in modal; used on submit)
  useEffect(() => {
    if (!preview) {
      setPreviewImageFile(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(preview);
        const blob = await res.blob();
        if (cancelled) return;
        const file = new File([blob], "image.png", { type: blob.type || "image/png" });
        setPreviewImageFile(file);
        setPreviewFormKey((k) => k + 1);
      } catch (err) {
        console.error("Failed to load preview image for search:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [preview]);

  return (
    <>
      {/* ================= GRID ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {media.map((item, index) => {
          const imageUrl = item.response.content[0].image_url;

          return (
            <div
              key={index}
              className="
                group relative rounded-2xl overflow-hidden
                bg-gray-100 aspect-square cursor-zoom-in
              "
              onClick={() => setPreview(imageUrl)}
            >
              {/* Image */}
              <img
                src={imageUrl}
                alt="Generated"
                loading="lazy"
                className="
                  w-full h-full object-cover
                  transition-transform duration-300
                  group-hover:scale-105
                "
              />

              {/* Gradient Overlay */}
              <div
                className="
                  absolute inset-0
                  bg-gradient-to-t
                  from-black/60 via-black/10 to-transparent
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                "
              />

              {/* Ellipsis menu (left, visible on hover) */}
              <div className="absolute bottom-3 left-3 pointer-events-auto" ref={openMenuIndex === index ? menuRef : null}>
                <button
                  type="button"
                  className={`
                    cursor-pointer transition-opacity duration-300
                    flex items-center justify-center
                    w-9 h-9 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black/80
                    ${openMenuIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuIndex((prev) => (prev === index ? null : index));
                  }}
                  aria-label="More options"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <circle cx="6" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="18" cy="12" r="1.5" />
                  </svg>
                </button>
                {openMenuIndex === index && (
                  <div
                    className="absolute bottom-full left-0 mb-2 min-w-[120px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-left text-gray-800 hover:bg-gray-100 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuIndex(null);
                        onDeleteMedia?.(item, index);
                      }}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Follow-up Button (right, always visible) */}
              <div
                className="
                  absolute bottom-3 right-3
                  pointer-events-auto cursor-pointer
                "
                onClick={(e) => {
                  e.stopPropagation();
                  handleAskFollowUp(imageUrl);
                }}
              >
                <div
                  className="
                    flex items-center gap-2
                    bg-black/70 backdrop-blur-md
                    text-white text-sm
                    px-4 py-2 rounded-full
                  "
                >
                  <span className="text-lg leading-none">+</span>
                  Ask follow-up
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= FOLLOW-UP SEARCH (inside center-content-wrapper, sticky to bottom) ================= */}
      {showFollowUpForm &&
        (() => {
          const wrapper = document.getElementById("center-content-wrapper");
          if (!wrapper) return null;
          return createPortal(
            <div className="w-full flex flex-col items-center">
              <SearchForm
                key={followUpFormKey}
                isThreadPage={true}
                styles="!w-full"
                initialUploadedFiles={followUpImageFile ? [followUpImageFile] : []}
                onAttachmentsCleared={() => setShowFollowUpForm(false)}
              />
            </div>,
            wrapper
          );
        })()}

      {/* ================= PREVIEW MODAL ================= */}
      {preview && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/85 backdrop-blur-sm
            flex flex-col items-center
            p-4 pt-6 gap-4
            animate-in fade-in duration-200
          "
          onClick={() => { setPreview(null); setPreviewImageFile(null); }}
        >
          {/* Close button - top right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              setPreviewImageFile(null);
            }}
            className="absolute top-4 right-4 z-10 p-2 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Close preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          <img
            src={preview}
            alt="Preview"
            className="
              max-h-[75vh]
              max-w-[92vw]
              object-contain
              rounded-xl
              shadow-2xl
              animate-in zoom-in duration-200
            "
            onClick={(e) => e.stopPropagation()}
          />

          {/* SearchForm under preview (no file metadata box; image still sent on submit) */}
          <div
            className="w-full max-w-2xl shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <SearchForm
              key={previewFormKey}
              isThreadPage={true}
              embedInModal={true}
              styles="!w-full"
              initialUploadedFiles={previewImageFile ? [previewImageFile] : []}
              hideFileMetadataBox={true}
            />
          </div>
        </div>
      )}
    </>
  );
}