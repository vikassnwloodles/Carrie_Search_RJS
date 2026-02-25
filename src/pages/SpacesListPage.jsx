import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api/fetchWithAuth";
import { fetchSpacesApi } from "../api/spacesApi";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";
import { useSearch } from "../context/SearchContext";

function timeAgo(isoDate) {
  if (!isoDate) return "";

  const now = new Date();
  const past = new Date(isoDate);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const units = [
    { name: "year", seconds: 31536000 },
    { name: "month", seconds: 2592000 },
    { name: "day", seconds: 86400 },
    { name: "hour", seconds: 3600 },
    { name: "minute", seconds: 60 },
    { name: "second", seconds: 1 },
  ];

  for (const unit of units) {
    const value = Math.floor(diffInSeconds / unit.seconds);
    if (value >= 1) {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return rtf.format(-value, unit.name);
    }
  }

  return "just now";
}

const folderIcon = (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const clockIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const lockIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const plusIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function SpacesListPage() {
  const navigate = useNavigate();
  const { logoutAndNavigate } = useAuthUtils();
  const { setNewSpaceForSidebar, setShowImg } = useSearch();

  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingSpace, setCreatingSpace] = useState(false);

  useEffect(() => {
    setShowImg(false);
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const list = await fetchSpacesApi();
        if (!cancelled) setSpaces(Array.isArray(list) ? list : []);
      } catch (err) {
        if (cancelled) return;
        if (err?.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate();
        } else {
          showCustomToast("Failed to load spaces", { type: "error" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; setShowImg(true); };
  }, []);

  async function handleCreateNewSpace() {
    if (creatingSpace) return;
    const newSpaceId = crypto.randomUUID();
    setCreatingSpace(true);
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/get-or-create-space/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            space_id: newSpaceId,
            space_name: "New Space",
            space_description: "Description of what this Space is for and how to use it",
            space_emoji: "",
          }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate();
          return;
        }
        showCustomToast(data?.detail || data?.error || "Failed to create space", { type: "error" });
        return;
      }

      setSpaces((prev) => [data, ...prev]);
      setNewSpaceForSidebar?.(data);
      navigate(`/space/${newSpaceId}`);
    } catch (err) {
      showCustomToast("Failed to create space", { type: "error" });
    } finally {
      setCreatingSpace(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-7 py-3.5 border-b border-black/[0.07]">
        <div className="text-sm text-stone-500">
          <span className="text-stone-800 font-medium">Spaces</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCreateNewSpace}
            disabled={creatingSpace}
            className="flex items-center gap-2 bg-stone-900 text-white border-none rounded-lg px-4 py-2 text-sm font-medium cursor-pointer tracking-wide hover:bg-stone-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {plusIcon}
            <span>{creatingSpace ? "Creating..." : "New Space"}</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 pt-10 pb-10">
        <h2 className="text-xl font-semibold text-stone-800 mb-6">My Spaces</h2>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-stone-400">
            <p className="text-sm">Loading spaces...</p>
          </div>
        ) : spaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-stone-400">
            <div className="text-stone-300 mb-3">{folderIcon}</div>
            <p className="text-sm">No spaces yet. Create one to get started.</p>
            <button
              type="button"
              onClick={handleCreateNewSpace}
              disabled={creatingSpace}
              className="mt-4 flex items-center gap-2 bg-stone-900 text-white border-none rounded-lg px-4 py-2 text-sm font-medium cursor-pointer hover:bg-stone-700 disabled:opacity-60"
            >
              {plusIcon}
              <span>New Space</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => {
              const spaceId = space.space_id ?? space.id;
              const name = space.space_name ?? space.name ?? "New Space";
              const updatedAt = space.updated_at ?? space.updated ?? space.last_updated ?? space.created_at ?? space.created;

              return (
                <button
                  key={spaceId}
                  type="button"
                  onClick={() => navigate(`/space/${spaceId}`)}
                  className="flex flex-col items-start text-left w-full bg-white rounded-xl border border-stone-200 p-6 shadow-sm hover:shadow-md hover:border-stone-300 transition-all cursor-pointer"
                >
                  <div className="flex justify-center w-full text-stone-400 mb-3">
                    {folderIcon}
                  </div>
                  <h3 className="text-base font-semibold text-stone-800 w-full truncate mb-2">
                    {name}
                  </h3>
                  <div className="flex items-center justify-between w-full text-xs text-stone-500 gap-2">
                    <span className="flex items-center gap-1.5 shrink-0">
                      {clockIcon}
                      {timeAgo(updatedAt) || "Just now"}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      {lockIcon}
                      Private
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
