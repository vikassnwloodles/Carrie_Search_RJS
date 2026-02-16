// src/components/Sidebar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomUserProfileSection from "./BottomUserProfileSection";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";
import { useSearch } from "../context/SearchContext";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export default function Sidebar() {
  const navigate = useNavigate();
  const { threadsContainer, setThreadsContainer, spacesContainer, setSpacesContainer } = useSearch();
  const { logoutAndNavigate } = useAuthUtils();
  const { isAuthenticated } = useAuth();


  /* -----------------------------
     State
  ------------------------------*/
  const [activePanel, setActivePanel] = useState(null); // "library" | "spaces" | null
  const [fetchedThreads, setFetchedThreads] = useState(false);
  const [fetchedSpaces, setFetchedSpaces] = useState(false);
  const hoverTimeoutRef = useRef(null);

  /* -----------------------------
     Hover control
  ------------------------------*/
  const openPanel = (panel) => {
    clearTimeout(hoverTimeoutRef.current);
    setActivePanel(panel);

    if (panel === "library") {
      fetchThreads();
    } else if (panel === "spaces") {
      fetchSpaces()
    }
  };

  const closePanel = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActivePanel(null);
    }, 120);
  };

  /* -----------------------------
     Fetch threads (once)
  ------------------------------*/
  async function fetchThreads() {
    if (fetchedThreads) return;

    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/threads/`, {
        headers: {
          "Content-Type": "application/json"
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate();
        } else {
          showCustomToast("Failed to load threads", { type: "error" });
        }
        return;
      }

      setThreadsContainer(Array.isArray(data) ? data : []);
      setFetchedThreads(true);
    } catch {
      showCustomToast("Network error while loading threads", { type: "error" });
    }
  }


  async function fetchSpaces() {
    if (fetchedSpaces) return;
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/get-spaces/`, {
        headers: {
          "Content-Type": "application/json"
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate();
        } else {
          showCustomToast("Failed to load spaces", { type: "error" });
        }
        return;
      }

      setSpacesContainer(Array.isArray(data) ? data : []);
      setFetchedSpaces(true);
    } catch {
      showCustomToast("Network error while loading spaces", { type: "error" });
    }
  }


  return (
    <>
      {/* PRIMARY SIDEBAR */}
      <aside className="w-20 bg-[#f7f7f4] border-r border-gray-200 p-4 flex flex-col items-center justify-between z-20">
        <nav className="flex flex-col space-y-6 items-center">

          {/* HOME */}
          <Link
            to="/"
            className="w-12 h-12 flex items-center justify-center
                       rounded-full bg-gray-200 text-gray-800"
            title="Home"
          >
            <i className="fas fa-home text-xl" />
          </Link>

          {/* LIBRARY */}
          <Link
            to="/library"
            className="text-gray-600"
            onMouseEnter={() => openPanel("library")}
            onMouseLeave={closePanel}
          >
            <div className="flex flex-col group items-center">
              <div className="w-10 h-10 p-2 rounded-full group-hover:bg-gray-200 flex items-center justify-center">
                <i className="fas fa-history text-lg"></i>
              </div>
              <span className="text-xs">Library</span>
            </div>
          </Link>

          {/* SPACES */}
          <Link
            // to="/spaces"
            className="text-gray-600"
            onMouseEnter={() => openPanel("spaces")}
            onMouseLeave={closePanel}
          >
            <div className="flex flex-col group items-center">
              <div className="w-10 h-10 p-2 rounded-full group-hover:bg-gray-200 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>
              <span className="text-xs">Spaces</span>
            </div>
          </Link>

        </nav>

        {isAuthenticated && <BottomUserProfileSection />}
      </aside>

      {/* SECONDARY SIDEBAR */}
      <aside
        onMouseEnter={() => openPanel(activePanel)}
        onMouseLeave={closePanel}
        className={`
          fixed left-20 top-0 h-full w-64
          bg-white border-r border-gray-200 shadow-lg z-50
          transition-all duration-200 ease-out
          ${activePanel
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2 pointer-events-none"
          }
        `}
      >
        <div className="p-4 space-y-4">

          {activePanel === "library" && (
            <>
              <h3 className="border-b pb-4 text-sm font-semibold text-gray-700">
                Library
              </h3>

              <span className="block px-3 py-2 text-sm font-semibold text-gray-700">
                Recent
              </span>

              {threadsContainer.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-500">
                  No recent threads
                </p>
              )}

              {threadsContainer.map((item) => (
                <Link
                  key={item.thread_id}
                  to={`/thread/${item.thread_id}`}
                  className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
                >
                  {item.title?.length > 20
                    ? item.title.slice(0, 20) + "..."
                    : item.title}
                </Link>
              ))}
            </>
          )}

          {activePanel === "spaces" && (
            <>
              <h3 className="border-b pb-4 text-sm font-semibold text-gray-700">
                Spaces
              </h3>

              {/* <p className="px-3 py-2 text-sm text-gray-500">
                Your Spaces content goes here.
              </p> */}
              <p
                className="px-3 py-2 text-sm text-gray-500 cursor-pointer"
                onClick={() => navigate(`/space/${crypto.randomUUID()}`)}
              >
                + Create new Space
              </p>
              {spacesContainer.map((item) => (
                <Link
                  key={item.space_id}
                  to={`/space/${item.space_id}`}
                  className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
                >
                  {item.space_name?.length > 20
                    ? item.space_name.slice(0, 20) + "..."
                    : item.space_name}
                </Link>
              ))}
            </>
          )}

        </div>
      </aside>
    </>
  );
}
