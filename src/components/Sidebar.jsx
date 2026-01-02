// src/components/Sidebar.jsx
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomUserProfileSection from "./BottomUserProfileSection";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";

export default function Sidebar({ setThreadId, threadsContainer, setThreadsContainer }) {

  const { logoutAndNavigate } = useAuthUtils();
  const { isAuthenticated } = useAuth();

  /* -----------------------------
     State
  ------------------------------*/
  const [isLibraryHovered, setIsLibraryHovered] = useState(false);
  const [fetchedThreads, setFetchedThreads] = useState(false);

  /* -----------------------------
     Hover control
  ------------------------------*/
  const hoverTimeoutRef = useRef(null);

  const openLibrary = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsLibraryHovered(true);
    fetchThreads();
  };

  const closeLibrary = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsLibraryHovered(false);
    }, 120);
  };

  /* -----------------------------
     Fetch threads (once)
  ------------------------------*/
  async function fetchThreads() {
    if (fetchedThreads) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/threads/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", {
            type: "warn",
          });
          logoutAndNavigate();
        } else {
          showCustomToast("Failed to load threads", { type: "error" });
        }
        return;
      }

      setThreadsContainer(Array.isArray(data) ? data : []);
      setFetchedThreads(true);
    } catch {
      showCustomToast("Network error while loading threads", {
        type: "error",
      });
    }
  }

  /* -----------------------------
     Render
  ------------------------------*/
  return (
    <>
      {/* PRIMARY SIDEBAR */}
      <aside
        className="w-20 bg-[#f7f7f4] border-r border-gray-200 p-4
                   flex flex-col items-center justify-between z-20"
      >
        <nav className="flex flex-col space-y-6 items-center">
          {/* HOME */}
          <Link
            to="/"
            onClick={() => setThreadId(null)}
            className="w-12 h-12 flex items-center justify-center
                       rounded-full bg-gray-200 text-gray-800"
            title="Home"
          >
            <i className="fas fa-home text-xl" />
          </Link>

          {/* LIBRARY ICON */}

          <Link
            to="/library"
            id="library-link"
            className="text-gray-600"
            title="History"
            aria-label="History"
            onMouseEnter={openLibrary}
            onMouseLeave={closeLibrary}
          >
            {/* <i className="fas fa-history text-xl" aria-hidden /> */}
            <div className="flex flex-col group items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" color="currentColor" className="w-10 h-10 p-2 rounded-full group-hover:bg-gray-200 tabler-icon shrink-0 duration-normal ease text-quiet" fill="currentColor" fillRule="evenodd"><path d="M9 15.9951C10.4319 15.9952 11.7044 16.6861 12.5029 17.752C13.3018 16.6913 14.5722 16.0049 16 16.0049H22.1299L22.2197 16.0098C22.6608 16.0547 23.0049 16.4269 23.0049 16.8799C23.0049 17.3328 22.6608 17.7051 22.2197 17.75L22.1299 17.7549H16C14.5532 17.7549 13.375 18.9331 13.375 20.3799V21.25C13.3749 21.7331 12.9831 22.1249 12.5 22.125C12.0169 22.1249 11.6251 21.7331 11.625 21.25V20.3701C11.625 18.9234 10.4467 17.7452 9 17.7451H2.87988C2.39676 17.7451 2.00501 17.3532 2.00488 16.8701C2.00488 16.3869 2.39669 15.9952 2.87988 15.9951H9ZM12.5 2.00488C18.3038 2.00495 22.9951 6.70738 22.9951 12.5V13.3799C22.9951 13.8631 22.6033 14.2548 22.1201 14.2549C21.6369 14.2548 21.2451 13.8631 21.2451 13.3799V12.5C21.2451 7.6727 17.3361 3.75495 12.5 3.75488C7.6633 3.75494 3.75488 7.66329 3.75488 12.5V13.3799C3.75488 13.8631 3.36313 14.2549 2.87988 14.2549C2.39669 14.2548 2.00488 13.8631 2.00488 13.3799V12.5C2.00488 6.69679 6.6968 2.00494 12.5 2.00488ZM12.5 6.375C15.8832 6.375 18.625 9.11675 18.625 12.5V13.3799C18.6249 13.8631 18.2332 14.2549 17.75 14.2549C17.2668 14.2549 16.8751 13.8631 16.875 13.3799V12.5C16.875 10.0833 14.9167 8.125 12.5 8.125C10.0832 8.125 8.125 10.0832 8.125 12.5V13.3799C8.12494 13.8631 7.73321 14.2549 7.25 14.2549C6.76679 14.2549 6.37506 13.8631 6.375 13.3799V12.5C6.375 9.11675 9.11675 6.375 12.5 6.375ZM12.5 10.75C13.4665 10.75 14.25 11.5335 14.25 12.5C14.2499 13.4664 13.4665 14.25 12.5 14.25C11.5335 14.25 10.7501 13.4664 10.75 12.5C10.75 11.5335 11.5335 10.75 12.5 10.75Z"></path></svg>
              <span className="text-xs">Library</span>
            </div>
          </Link>

        </nav>

        {isAuthenticated && <BottomUserProfileSection />}
      </aside>

      {/* SECONDARY SIDEBAR (OUTSIDE PRIMARY) */}
      <aside
        onMouseEnter={openLibrary}
        onMouseLeave={closeLibrary}
        className={`
          fixed left-20 top-0 h-full w-64
          bg-white border-r border-gray-200 shadow-lg z-50
          transition-all duration-200 ease-out
          ${isLibraryHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2 pointer-events-none"
          }
        `}
      >
        <div className="p-4 space-y-4">
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
              to={`/search/${item.thread_id}`}
              onClick={() => setThreadId(item.thread_id)}
              className="block px-3 py-2 rounded-md
                         hover:bg-gray-100 text-sm"
            >
              {item.prompt?.length > 20
                ? item.prompt.slice(0, 20) + "..."
                : item.prompt}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
