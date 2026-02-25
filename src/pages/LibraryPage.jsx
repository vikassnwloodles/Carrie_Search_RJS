import React, { useEffect, useMemo, useRef, useState } from "react";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { fetchWithAuth } from "../api/fetchWithAuth";
import ChooseSpaceModal from "../components/Library/ChooseSpaceModal";
import { useRemoveThreadFromSpace } from "../hooks/useRemoveThreadFromSpace";
import EditThreadTitleModal from "../components/Library/EditThreadTitleModal";
import DeleteConfirmModal from "../components/Modals/DeleteConfirmModal";
import { deleteThreadAPI } from "../api/threadsApi";
import { deleteGeneratedMediaAPI } from "../api/mediaApi";
import MediaGallery from "../components/Library/MediaGallery";

/* -----------------------------
   Time ago helper
------------------------------*/
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

// const TABS = ["Threads", "Media", "Apps", "Documents"];
const TABS = ["Threads", "Media", "Documents"];
const PAGE_SIZE = 20;

export default function LibraryPage() {
  const { removeThreadFromSpace } = useRemoveThreadFromSpace();
  const { setShowImg } = useSearch();
  const navigate = useNavigate();
  const { logoutAndNavigate } = useAuthUtils();
  const { threadsContainer, setThreadsContainer, setDeletedThreadId } = useSearch();

  const menuRef = useRef(null);
  const loadMoreSentinelRef = useRef(null);

  const [activeTab, setActiveTab] = useState("Threads");
  const [search, setSearch] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [sort, setSort] = useState("newest");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentThread, setCurrentThread] = useState(null);
  const [currentSpace, setCurrentSpace] = useState(null);
  const [showChooseSpaceModal, setShowChooseSpaceModal] = useState(false);
  const [showEditThreadTitleModal, setShowEditThreadTitleModal] = useState(false);
  const [showDeleteThreadModal, setShowDeleteThreadModal] = useState(false);
  const [media, setMedia] = useState([]);
  const [documents, setDocuments] = useState([]);

  /* -----------------------------
     Pagination state (infinite scroll)
  ------------------------------*/
  const [threadsPage, setThreadsPage] = useState(1);
  const [hasMoreThreads, setHasMoreThreads] = useState(true);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [mediaPage, setMediaPage] = useState(1);
  const [hasMoreMedia, setHasMoreMedia] = useState(true);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [docsPage, setDocsPage] = useState(1);
  const [hasMoreDocs, setHasMoreDocs] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);

  /* -----------------------------
     Fetch threads (paginated)
  ------------------------------*/
  async function fetchThreads(page = 1, append = false) {
    if (loadingThreads) return;
    setLoadingThreads(true);
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/threads/?page=${page}&page_size=${PAGE_SIZE}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const resJson = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate();
        } else {
          if (append) setHasMoreThreads(false);
          else showCustomToast("Failed to load threads", { type: "error" });
        }
        return;
      }

      const data = Array.isArray(resJson) ? resJson : resJson.results ?? resJson.data ?? [];
      if (append) {
        setThreadsContainer((prev) => [...prev, ...data]);
      } else {
        setThreadsContainer(data);
      }
      const hasNext = resJson.next != null ? !!resJson.next : data.length >= PAGE_SIZE;
      setHasMoreThreads(hasNext);
      if (page === 1) setThreadsPage(1);
      else setThreadsPage((p) => p + 1);
    } catch (err) {
      if (append) setHasMoreThreads(false);
      else showCustomToast("Network error while loading threads", { type: "error" });
    } finally {
      setLoadingThreads(false);
    }
  }

  /* -----------------------------
     Fetch media (paginated)
  ------------------------------*/
  async function fetchMedia(page = 1, append = false) {
    if (loadingMedia) return;
    setLoadingMedia(true);
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/get-generated-media/?page=${page}&page_size=${PAGE_SIZE}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const resJson = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate();
        } else {
          showCustomToast("Failed to load media", { type: "error" });
        }
        return;
      }

      const data = resJson.data ?? resJson.results ?? (Array.isArray(resJson) ? resJson : []);
      if (append) {
        setMedia((prev) => [...prev, ...data]);
      } else {
        setMedia(data);
      }
      const hasNextMedia = resJson.next != null ? !!resJson.next : data.length >= PAGE_SIZE;
      setHasMoreMedia(hasNextMedia);
      if (page === 1) setMediaPage(1);
      else setMediaPage((p) => p + 1);
    } catch (err) {
      showCustomToast("Network error while loading media", { type: "error" });
    } finally {
      setLoadingMedia(false);
    }
  }

  /* -----------------------------
     Fetch documents (paginated)
  ------------------------------*/
  async function fetchDocuments(page = 1, append = false) {
    if (loadingDocs) return;
    setLoadingDocs(true);
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/get-generated-docs/?page=${page}&page_size=${PAGE_SIZE}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const resJson = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate();
          return;
        }
        showCustomToast("Failed to load documents", { type: "error" });
        return;
      }

      const data = resJson.data ?? resJson.results ?? (Array.isArray(resJson) ? resJson : []);
      if (append) {
        setDocuments((prev) => [...prev, ...data]);
      } else {
        setDocuments(data);
      }
      const hasNextDocs = resJson.next != null ? !!resJson.next : data.length >= PAGE_SIZE;
      setHasMoreDocs(hasNextDocs);
      if (page === 1) setDocsPage(1);
      else setDocsPage((p) => p + 1);
    } catch (err) {
      showCustomToast("Network error while loading documents", { type: "error" });
    } finally {
      setLoadingDocs(false);
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "Media") {
      if (media.length === 0) fetchMedia(1, false);
    } else if (tab === "Documents") {
      if (documents.length === 0) fetchDocuments(1, false);
    }
  };

  /* -----------------------------
     Infinite scroll: observe sentinel, load more when visible
  ------------------------------*/
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;

        if (activeTab === "Threads" && hasMoreThreads && !loadingThreads) {
          fetchThreads(threadsPage + 1, true);
        } else if (activeTab === "Media" && hasMoreMedia && !loadingMedia) {
          fetchMedia(mediaPage + 1, true);
        } else if (activeTab === "Documents" && hasMoreDocs && !loadingDocs) {
          fetchDocuments(docsPage + 1, true);
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeTab, hasMoreThreads, hasMoreMedia, hasMoreDocs, loadingThreads, loadingMedia, loadingDocs, threadsPage, mediaPage, docsPage]);

  /* -----------------------------
     Lifecycle
  ------------------------------*/
  useEffect(() => {
    setShowImg(false);
    fetchThreads(1, false);
    return () => setShowImg(true);
  }, []);

  /* -----------------------------
     Derived threads (SEARCH + SORT)
  ------------------------------*/
  const threads = useMemo(() => {
    let data = [...threadsContainer];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (t) =>
          t?.prompt?.toLowerCase()?.includes(q) ||
          t?.response?.choices?.[0]?.message?.content?.toLowerCase()?.includes(q)
      );
    }

    data.sort((a, b) => {
      const t1 = new Date(a?.last_activity).getTime();
      const t2 = new Date(b?.last_activity).getTime();
      return sort === "newest" ? t2 - t1 : t1 - t2;
    });

    return data;
  }, [threadsContainer, search, sort]);

  /* -----------------------------
     Selection helpers
  ------------------------------*/
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === threads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(threads.map((t) => t.id)));
    }
  };

  const toggleMenu = (id, event) => {
    event.stopPropagation();
    setOpenMenuId(id);
  };

  useEffect(() => {
    if (!openMenuId) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleRenameThread = async (e, thread) => {
    e.stopPropagation();
    setShowEditThreadTitleModal(true);
    setOpenMenuId(null);
    setCurrentThread(thread);
  };

  const handleDeleteThread = (e, thread) => {
    e.stopPropagation();
    setShowDeleteThreadModal(true);
    setOpenMenuId(null);
    setCurrentThread(thread);
  };

  /* -----------------------------
     Render
  ------------------------------*/
  return (
    <>
      <div className="w-full max-w-5xl mx-auto px-4 py-6">

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              // onClick={() => setActiveTab(tab)}
              onClick={() => handleTabChange(tab)}
              className={`cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors duration-150 relative
                ${activeTab === tab
                  ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900 after:rounded-full"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Threads" ? (
          <>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search your Threads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm bg-white"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
              </select>
            </div>

            {/* Threads list */}
            <div className="divide-y border-t">
              {threads.map((thread, index) => {
                const id = thread.id;
                const checked = selectedIds.has(id);
                const isLastThread = index === threads.length - 1;

                return (
                  <div
                    key={id}
                    className={`py-4 flex gap-3 cursor-pointer hover:bg-gray-50 ${checked ? "bg-gray-50" : ""}`}
                    onClick={() =>
                      selectMode ? toggleSelect(id) : navigate(`/thread/${thread.thread_id}`)
                    }
                  >
                    {selectMode && (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                    )}

                    <div className="flex-1">
                      <span className="flex flex-row items-center relative">
                        <h3 className="font-medium text-gray-900 line-clamp-1">
                          {thread.title ?? "Untitled thread"}
                        </h3>
                        <i
                          className={`fa fa-ellipsis ml-auto hover:bg-gray-200 px-2 py-1 rounded-sm ${id === openMenuId && "bg-gray-200"}`}
                          onClick={(event) => toggleMenu(id, event)}
                        ></i>
                        {id === openMenuId && (
                          <div
                            ref={menuRef}
                            className={`z-[999] flex flex-col absolute text-sm right-0 bg-white border border-gray-200 p-2 rounded-xl gap-2 w-52 shadow-xl ${isLastThread ? "bottom-full mb-1" : "top-7"}`}
                          >
                            {!thread.space ? (
                              <span
                                className="hover:bg-gray-200 p-2 rounded-md cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowChooseSpaceModal(true);
                                  setOpenMenuId(null);
                                  setCurrentThread(thread);
                                }}
                              >
                                <i className="fa fa-plus mr-2"></i>Add to Space
                              </span>
                            ) : (
                              <>
                                <span
                                  className="hover:bg-gray-200 p-2 rounded-md cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowChooseSpaceModal(true);
                                    setOpenMenuId(null);
                                    setCurrentThread(thread);
                                    setCurrentSpace(thread.space);
                                  }}
                                >
                                  <i className="fa fa-shuffle mr-2"></i>Swap Space
                                </span>
                                <span
                                  className="hover:bg-gray-200 p-2 rounded-md cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    removeThreadFromSpace(thread.thread_id, () =>
                                      setThreadsContainer((prev) =>
                                        prev.map((item) =>
                                          item.thread_id === thread.thread_id
                                            ? { ...item, space: null }
                                            : item
                                        )
                                      )
                                    );
                                  }}
                                >
                                  <i className="fa fa-close mr-2"></i>Remove from Space
                                </span>
                              </>
                            )}
                            <span
                              className="hover:bg-gray-200 p-2 rounded-md cursor-pointer"
                              onClick={(e) => handleRenameThread(e, thread)}
                            >
                              <i className="fa fa-pencil mr-2"></i>Rename Thread
                            </span>
                            <hr />
                            <span
                              className="hover:bg-gray-200 p-2 rounded-md cursor-pointer"
                              onClick={(e) => handleDeleteThread(e, thread)}
                            >
                              <i className="fa fa-trash mr-2"></i>Delete
                            </span>
                          </div>
                        )}
                      </span>

                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {thread.first_message ?? ""}
                      </p>

                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>🕒</span>
                          <span>{timeAgo(thread.last_activity)}</span>
                        </div>

                        {thread.space && (
                          <div
                            className="truncate max-w-48 border border-gray-200 text-gray-900 font-medium rounded-full px-3 py-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/space/${thread.space.space_id}`);
                            }}
                          >
                            {thread.space.space_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {threads.length === 0 && !loadingThreads && (
                <p className="text-center text-gray-500 py-8">No threads found</p>
              )}
            </div>
            <div ref={loadMoreSentinelRef} className="h-4 flex-shrink-0" aria-hidden />
            {loadingThreads && (
              <p className="text-center py-3 text-gray-500 text-sm">Loading more...</p>
            )}
          </>
        )
          : activeTab === "Media" ? (
            media.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <i className="fa-solid fa-photo-film text-4xl mb-3" />
                <p className="text-sm">No media yet</p>
              </div>
            ) : (
              <>
                <MediaGallery
                  media={media}
                  onDeleteMedia={async (item, index) => {
                    const searchResultId = item.id ?? item.search_result_id;
                    if (searchResultId == null) {
                      setMedia((prev) => prev.filter((_, i) => i !== index));
                      return;
                    }
                    try {
                      await deleteGeneratedMediaAPI(searchResultId);
                      setMedia((prev) =>
                        prev.filter((m) => (m.id ?? m.search_result_id) !== searchResultId)
                      );
                      showCustomToast("Media deleted", { type: "success" });
                    } catch (err) {
                      showCustomToast(err.message || "Failed to delete media", { type: "error" });
                    }
                  }}
                />
                <div ref={loadMoreSentinelRef} className="h-4 flex-shrink-0" aria-hidden />
                {loadingMedia && (
                  <p className="text-center py-3 text-gray-500 text-sm">Loading more...</p>
                )}
              </>
            )
          )
          : activeTab === "Documents" ? (
            documents.length === 0 && !loadingDocs ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <i className="fa-solid fa-file-lines text-4xl mb-3" />
                <p className="text-sm">No documents yet</p>
              </div>
            ) : (
              <>
                <div className="divide-y border-t">
                  {documents.map((doc) => {
                    const content = doc.response?.content?.[0];
                    const docUrl = content?.doc_url ?? "";
                    const docName = content?.doc_name ?? "document";
                    const prompt = doc.prompt ?? "";
                    return (
                      <div
                        key={doc.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-800 line-clamp-2">{prompt || "Generated document"}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate">{docName}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {doc.thread != null && (
                            <button
                              type="button"
                              onClick={() => navigate(`/thread/${doc.thread.thread_id}`)}
                              className="cursor-pointer text-sm text-teal-600 hover:text-teal-700 hover:underline"
                            >
                              Open thread
                            </button>
                          )}
                          {docUrl && (
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
                            >
                              <i className="fas fa-external-link-alt text-xs" />
                              Open / Download
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div ref={loadMoreSentinelRef} className="h-4 flex-shrink-0" aria-hidden />
                {loadingDocs && (
                  <p className="text-center py-3 text-gray-500 text-sm">Loading more...</p>
                )}
              </>
            )
          )
            : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <i className="fa-solid fa-grip text-4xl mb-3" />
                <p className="text-sm">No {activeTab.toLowerCase()} yet</p>
              </div>
            )}
      </div>

      <ChooseSpaceModal
        currentThread={currentThread}
        currentSpace={currentSpace}
        setThreadsContainer={setThreadsContainer}
        showChooseSpaceModal={showChooseSpaceModal}
        setShowChooseSpaceModal={setShowChooseSpaceModal}
      />
      <EditThreadTitleModal
        currentThread={currentThread}
        showEditThreadTitleModal={showEditThreadTitleModal}
        setShowEditThreadTitleModal={setShowEditThreadTitleModal}
        setThreadsContainer={setThreadsContainer}
      />
      <DeleteConfirmModal
        title={"Delete Thread"}
        message={"Are you sure you want to delete this Thread?"}
        isOpen={showDeleteThreadModal}
        onClose={() => setShowDeleteThreadModal(false)}
        onConfirm={async () => {
          try {
            await deleteThreadAPI(currentThread.thread_id);
            setShowDeleteThreadModal(false);
            setDeletedThreadId(currentThread.thread_id);
            setThreadsContainer((prev) =>
              prev.filter((thread) => thread.thread_id !== currentThread.thread_id)
            );
          } catch (err) {
            showCustomToast("Something went wrong!", { type: "error" });
          }
        }}
      />
    </>
  );
}