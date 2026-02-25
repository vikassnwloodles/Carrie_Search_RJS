// src/components/Sidebar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomUserProfileSection from "./BottomUserProfileSection";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";
import { fetchWithAuth } from "../api/fetchWithAuth";
import { useSearch } from "../context/SearchContext";

const SIDEBAR_PAGE_SIZE = 20;

export default function Sidebar() {
  const navigate = useNavigate();
  const { logoutAndNavigate } = useAuthUtils();
  const { isAuthenticated } = useAuth();
  const { deletedSpaceId, setDeletedSpaceId, updatedSpace, setUpdatedSpace, newThreadForSidebar, setNewThreadForSidebar, deletedThreadId, setDeletedThreadId, newSpaceForSidebar, setNewSpaceForSidebar } = useSearch();

  const hoverTimeoutRef = useRef(null);
  const libraryScrollRef = useRef(null);
  const loadMoreSentinelRef = useRef(null);
  const loadMoreSpacesSentinelRef = useRef(null);

  /* -----------------------------
     State
  ------------------------------*/
  const [activePanel, setActivePanel] = useState(null); // "library" | "spaces" | null
  const [sidebarThreads, setSidebarThreads] = useState([]);
  const [sidebarThreadsPage, setSidebarThreadsPage] = useState(1);
  const [hasMoreSidebarThreads, setHasMoreSidebarThreads] = useState(true);
  const [loadingSidebarThreads, setLoadingSidebarThreads] = useState(false);
  const [libraryPanelFetched, setLibraryPanelFetched] = useState(false);

  const [sidebarSpaces, setSidebarSpaces] = useState([]);
  const [sidebarSpacesPage, setSidebarSpacesPage] = useState(1);
  const [hasMoreSidebarSpaces, setHasMoreSidebarSpaces] = useState(true);
  const [loadingSidebarSpaces, setLoadingSidebarSpaces] = useState(false);
  const [spacesPanelFetched, setSpacesPanelFetched] = useState(false);
  const [creatingSpace, setCreatingSpace] = useState(false);

  /* -----------------------------
     Hover control
  ------------------------------*/
  const openPanel = (panel) => {
    clearTimeout(hoverTimeoutRef.current);
    setActivePanel(panel);

    if (panel === "library") {
      if (isAuthenticated && !libraryPanelFetched) {
        fetchSidebarThreads(1, false);
      }
    } else if (panel === "spaces") {
      if (isAuthenticated && !spacesPanelFetched) {
        fetchSidebarSpaces(1, false);
      }
    }
  };

  const closePanel = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActivePanel(null);
    }, 120);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLibraryPanelFetched(false);
      setSpacesPanelFetched(false);
    }
  }, [isAuthenticated]);

  // Remove deleted space from sidebar list when Space page reports deletion
  useEffect(() => {
    if (!deletedSpaceId) return;
    setSidebarSpaces((prev) => prev.filter((s) => s.space_id !== deletedSpaceId));
    setDeletedSpaceId(null);
  }, [deletedSpaceId, setDeletedSpaceId]);

  // Update space in sidebar list when Space page reports name/other updates
  useEffect(() => {
    if (!updatedSpace?.space_id) return;
    setSidebarSpaces((prev) =>
      prev.map((s) => (s.space_id === updatedSpace.space_id ? { ...s, ...updatedSpace } : s))
    );
    setUpdatedSpace(null);
  }, [updatedSpace, setUpdatedSpace]);

  // Prepend new thread to sidebar when a new search completes (user redirected to /thread/<id>)
  useEffect(() => {
    if (!newThreadForSidebar?.thread_id) return;
    setSidebarThreads((prev) => {
      if (prev.some((t) => t.thread_id === newThreadForSidebar.thread_id)) return prev;
      return [{ thread_id: newThreadForSidebar.thread_id, title: newThreadForSidebar.title ?? "New thread" }, ...prev];
    });
    setNewThreadForSidebar(null);
  }, [newThreadForSidebar, setNewThreadForSidebar]);

  // Remove deleted thread from sidebar list when Library page deletes a thread
  useEffect(() => {
    if (!deletedThreadId) return;
    setSidebarThreads((prev) => prev.filter((t) => t.thread_id !== deletedThreadId));
    setDeletedThreadId(null);
  }, [deletedThreadId, setDeletedThreadId]);

  // Prepend new space to sidebar when Space page creates a space (e.g. via "Add to Space" → "New Space")
  useEffect(() => {
    if (!newSpaceForSidebar?.space_id) return;
    setSidebarSpaces((prev) => {
      if (prev.some((s) => s.space_id === newSpaceForSidebar.space_id)) return prev;
      return [newSpaceForSidebar, ...prev];
    });
    setNewSpaceForSidebar(null);
  }, [newSpaceForSidebar, setNewSpaceForSidebar]);

  /* -----------------------------
     Fetch sidebar threads (paginated, infinite scroll)
  ------------------------------*/
  async function fetchSidebarThreads(page, append) {
    if (loadingSidebarThreads) return;
    setLoadingSidebarThreads(true);
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/threads/?page=${page}&page_size=${SIDEBAR_PAGE_SIZE}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const resJson = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setLibraryPanelFetched(true);
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate();
          return;
        }
        if (append) setHasMoreSidebarThreads(false);
        else showCustomToast("Failed to load threads", { type: "error" });
        return;
      }

      const data = Array.isArray(resJson) ? resJson : resJson.results ?? resJson.data ?? [];
      if (append) {
        setSidebarThreads((prev) => [...prev, ...data]);
      } else {
        setSidebarThreads(data);
      }
      setHasMoreSidebarThreads(resJson.next != null ? !!resJson.next : data.length >= SIDEBAR_PAGE_SIZE);
      setSidebarThreadsPage(page);
      if (page === 1) setLibraryPanelFetched(true);
    } catch (err) {
      if (append) setHasMoreSidebarThreads(false);
      else showCustomToast("Failed to load threads", { type: "error" });
    } finally {
      setLoadingSidebarThreads(false);
    }
  }

  /* -----------------------------
     Fetch sidebar spaces (paginated, infinite scroll)
  ------------------------------*/
  async function fetchSidebarSpaces(page, append) {
    if (loadingSidebarSpaces) return;
    setLoadingSidebarSpaces(true);
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/get-spaces/?page=${page}&page_size=${SIDEBAR_PAGE_SIZE}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const resJson = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setSpacesPanelFetched(true);
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate();
          return;
        }
        showCustomToast("Failed to load spaces", { type: "error" });
        return;
      }

      const data = Array.isArray(resJson) ? resJson : resJson.results ?? resJson.data ?? [];
      const list = Array.isArray(data) ? data : [];
      if (append) {
        setSidebarSpaces((prev) => [...prev, ...list]);
      } else {
        setSidebarSpaces(list);
      }
      setHasMoreSidebarSpaces(resJson.next != null ? !!resJson.next : list.length >= SIDEBAR_PAGE_SIZE);
      setSidebarSpacesPage(page);
      if (page === 1) setSpacesPanelFetched(true);
    } catch (err) {
      showCustomToast("Failed to load spaces", { type: "error" });
    } finally {
      setLoadingSidebarSpaces(false);
    }
  }

  /* -----------------------------
     Infinite scroll: load more when sentinel is visible inside the library panel scroll area
  ------------------------------*/
  useEffect(() => {
    if (activePanel !== "library") return;
    const sentinel = loadMoreSentinelRef.current;
    const scrollRoot = libraryScrollRef.current;
    if (!sentinel || !scrollRoot) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (isAuthenticated && hasMoreSidebarThreads && !loadingSidebarThreads) {
          fetchSidebarThreads(sidebarThreadsPage + 1, true);
        }
      },
      { root: scrollRoot, rootMargin: "100px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activePanel, isAuthenticated, hasMoreSidebarThreads, loadingSidebarThreads, sidebarThreadsPage]);

  /* -----------------------------
     Infinite scroll: load more spaces when sentinel is visible
  ------------------------------*/
  useEffect(() => {
    if (activePanel !== "spaces") return;
    const sentinel = loadMoreSpacesSentinelRef.current;
    const scrollRoot = libraryScrollRef.current;
    if (!sentinel || !scrollRoot) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (isAuthenticated && hasMoreSidebarSpaces && !loadingSidebarSpaces) {
          fetchSidebarSpaces(sidebarSpacesPage + 1, true);
        }
      },
      { root: scrollRoot, rootMargin: "100px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activePanel, isAuthenticated, hasMoreSidebarSpaces, loadingSidebarSpaces, sidebarSpacesPage]);

  /* -----------------------------
     Create new space: call API, add to sidebar list, then navigate
  ------------------------------*/
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
            space_description: "",
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

      setSidebarSpaces((prev) => [data, ...prev]);
      navigate(`/space/${newSpaceId}`);
    } catch (err) {
      showCustomToast("Failed to create space", { type: "error" });
    } finally {
      setCreatingSpace(false);
    }
  }

  // async function fetchSpaces() {
  //   if (fetchedSpaces) return;

  //   try {
  //     const data = await fetchSpacesApi();

  //     setSpacesContainer(data);
  //     setFetchedSpaces(true);

  //   } catch (err) {
  //     if (err.status === 401) {
  //       showCustomToast(
  //         "Session expired. Please log in again.",
  //         { type: "warn" }
  //       );
  //       logoutAndNavigate();
  //     } else {
  //       showCustomToast(
  //         "Failed to load spaces",
  //         { type: "error" }
  //       );
  //     }
  //   }
  // }



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
          fixed left-20 top-0 h-full w-64 flex flex-col
          bg-white border-r border-gray-200 shadow-lg z-50
          transition-all duration-200 ease-out
          ${activePanel
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2 pointer-events-none"
          }
        `}
      >
        <div className="p-4 shrink-0 space-y-4">

          {activePanel === "library" && (
            <>
              <h3 className="border-b pb-4 text-sm font-semibold text-gray-700">
                Library
              </h3>

              <span className="block px-3 py-2 text-sm font-semibold text-gray-700">
                Recent
              </span>
            </>
          )}

          {activePanel === "spaces" && (
            <>
              <h3 className="border-b pb-4 text-sm font-semibold text-gray-700">
                Spaces
              </h3>
            </>
          )}

        </div>

        <div
          ref={libraryScrollRef}
          className="flex-1 min-h-0 overflow-y-auto scrollbar-auto p-4 pt-0"
        >
          {activePanel === "library" && (
            <>
              {sidebarThreads.length === 0 && !loadingSidebarThreads && (
                <p className="px-3 py-2 text-sm text-gray-500">
                  No recent threads
                </p>
              )}

              {sidebarThreads.map((item) => (
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

              <div ref={loadMoreSentinelRef} className="h-2 flex-shrink-0" aria-hidden />
              {loadingSidebarThreads && (
                <p className="px-3 py-2 text-sm text-gray-500">Loading more...</p>
              )}
            </>
          )}

          {activePanel === "spaces" && (
            <>
              <p
                className="px-3 py-2 text-sm text-gray-500 cursor-pointer hover:text-gray-700 disabled:opacity-60"
                onClick={handleCreateNewSpace}
                role="button"
                aria-disabled={creatingSpace}
              >
                {creatingSpace ? "Creating..." : "+ Create new Space"}
              </p>
              {sidebarSpaces.length === 0 && !loadingSidebarSpaces && (
                <p className="px-3 py-2 text-sm text-gray-500">No spaces yet</p>
              )}
              {sidebarSpaces.map((item) => (
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
              <div ref={loadMoreSpacesSentinelRef} className="h-2 flex-shrink-0" aria-hidden />
              {loadingSidebarSpaces && (
                <p className="px-3 py-2 text-sm text-gray-500">Loading more...</p>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
