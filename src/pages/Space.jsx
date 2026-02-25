import { useEffect, useRef, useState } from "react";
import { useSearch } from "../context/SearchContext";
import SearchForm from "../components/SearchForm";
import EmojiPicker from "emoji-picker-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { showCustomToast } from "../utils/customToast";
import { fetchWithAuth } from "../api/fetchWithAuth";
import ThreadsList from "../components/ThreadsList";
import SettingsModal from "../components/Space/SettingsModal";
import { useAddThreadToSpace } from "../hooks/useAddThreadToSpace";
import DeleteConfirmModal from "../components/Modals/DeleteConfirmModal";

const icons = {
    folder: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
    ),
    user: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    plus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    mic: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    ),
    chevronRight: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    ),
    upload: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
    ),
    cloud: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
    ),
    paste: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
    ),
    link: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    ),
    calendar: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    clock: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    share: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    ),
    moreHoriz: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5" cy="12" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="19" cy="12" r="1" fill="currentColor" />
        </svg>
    ),
    chevronDown: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    ),
    soundwave: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="8" y1="9" x2="8" y2="15" />
            <line x1="16" y1="9" x2="16" y2="15" />
            <line x1="4" y1="11" x2="4" y2="13" />
            <line x1="20" y1="11" x2="20" y2="13" />
        </svg>
    ),
};

function SidebarAction({ icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 bg-transparent hover:bg-stone-100 border-none cursor-pointer px-0.5 py-1 rounded-md text-left w-full transition-colors duration-150"
        >
            <span className="text-stone-400 flex items-center">{icon}</span>
            <span className="text-sm text-stone-500 ">{label}</span>
        </button>
    );
}

export default function Space() {
    const location = useLocation();
    const { thread } = location.state || {};

    const { setShowImg, setSpacesContainer, setDeletedSpaceId, setUpdatedSpace } = useSearch()
    const { spaceId } = useParams();
    const navigate = useNavigate();
    const { addThreadToSpace } = useAddThreadToSpace();

    const moreOptionsRef = useRef(null)
    const fileInputRef = useRef(null);
    const spaceThreadsSentinelRef = useRef(null);

    const SPACE_THREADS_PAGE_SIZE = 20;

    const [uploading, setUploading] = useState(false);
    const [spaceName, setSpaceName] = useState("New Space");
    const [description, setDescription] = useState("Description of what this Space is for and how to use it");
    const [editingName, setEditingName] = useState(false);
    const [editingDesc, setEditingDesc] = useState(false);
    const [showPicker, setShowPicker] = useState(false)
    const [text, setText] = useState("")
    const [spaceThreads, setSpaceThreads] = useState([])
    const [spaceThreadsPage, setSpaceThreadsPage] = useState(1)
    const [hasMoreSpaceThreads, setHasMoreSpaceThreads] = useState(true)
    const [loadingSpaceThreads, setLoadingSpaceThreads] = useState(false)
    const [showMoreOptions, setShowMoreOptions] = useState(false)
    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    const [openDeleteConfirmModal, setOpenDeleteConfirmModal] = useState(false);
    const [instructions, setInstructions] = useState("");
    const [includeWeb, setIncludeWeb] = useState(true);
    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([])


    const isFirstRender = useRef(true);

    async function get_or_create_space() {
        try {
            const resp = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/get-or-create-space/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "space_id": spaceId,
                    "space_name": spaceName,
                    "space_description": description,
                    "space_emoji": text
                })
            })

            const respJson = await resp.json()

            if (!resp.ok) {
                if (resp.status === 401) {
                    // SESSOIN EXPIRED
                } else {
                    showCustomToast(respJson, { type: "error" });
                }
            } else {
                // SUCCESS
                setSpaceName(respJson.space_name)
                setDescription(respJson.space_description)
                setText(respJson.space_emoji)
                setInstructions(respJson.answer_instructions)
                if (resp.status === 201) {
                    setSpacesContainer(prev => [respJson, ...prev])
                    if (thread) {
                        addThreadToSpace(thread.thread_id, spaceId)
                    }
                }
            }
        } catch (e) {
            // SOMETHING WENT WRONG
            showCustomToast({ message: "Something went wrong" }, { type: "error" });
        } finally {

        }
    }


    async function update_space() {
        try {
            const resp = await fetchWithAuth(
                `${import.meta.env.VITE_API_URL}/update-space/`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        space_id: spaceId,
                        space_name: spaceName,
                        space_description: description,
                        space_emoji: text,
                        answer_instructions: instructions
                    })
                }
            );

            const respJson = await resp.json().catch(() => null);

            // ❌ API ERROR
            if (!resp.ok) {
                if (resp.status === 401) {
                    // SESSION EXPIRED (handle later)
                } else {
                    showCustomToast(
                        respJson?.detail || "Failed to update space",
                        { type: "error" }
                    );
                }

                return { success: false };
            }

            // ✅ SUCCESS — update local state
            setSpaceName(respJson.space_name);
            setDescription(respJson.space_description);

            setSpacesContainer(prev =>
                prev.map(space =>
                    space.space_id === respJson.space_id
                        ? {
                            ...space,
                            space_name: respJson.space_name,
                            space_description: respJson.space_description,
                        }
                        : space
                )
            );
            setUpdatedSpace(respJson);

            return {
                success: true,
                data: respJson
            };

        } catch (e) {
            showCustomToast("Something went wrong", { type: "error" });

            return { success: false };
        }
    }


    async function get_threads_by_space(page, append) {
        if (loadingSpaceThreads) return;
        setLoadingSpaceThreads(true);
        try {
            const url = `${import.meta.env.VITE_API_URL}/get-threads-by-space/${spaceId}/?page=${page}&page_size=${SPACE_THREADS_PAGE_SIZE}`;
            const resp = await fetchWithAuth(url, { method: "GET", headers: { "Content-Type": "application/json" } });
            const respJson = await resp.json();

            if (!resp.ok) {
                if (resp.status === 401) {
                    // SESSION EXPIRED
                } else {
                    showCustomToast(respJson?.detail || respJson?.error || "Failed to load threads", { type: "error" });
                }
                return;
            }

            const data = Array.isArray(respJson) ? respJson : respJson.results ?? respJson.data ?? [];
            const list = Array.isArray(data) ? data : [];

            if (append) {
                setSpaceThreads((prev) => [...(Array.isArray(prev) ? prev : []), ...list]);
            } else {
                setSpaceThreads(list);
            }

            const hasNext = respJson.next != null ? !!respJson.next : list.length >= SPACE_THREADS_PAGE_SIZE;
            setHasMoreSpaceThreads(append && list.length === 0 ? false : hasNext);
            setSpaceThreadsPage(page);
        } catch (e) {
            showCustomToast({ message: "Something went wrong" }, { type: "error" });
        } finally {
            setLoadingSpaceThreads(false);
        }
    }


    async function delete_space() {
        try {
            const resp = await fetchWithAuth(
                `${import.meta.env.VITE_API_URL}/spaces/${spaceId}/`,
                { method: "DELETE" }
            );

            if (!resp.ok) {
                const errorData = await resp.json().catch(() => null);

                showCustomToast(
                    errorData?.detail || "Failed to delete space",
                    { type: "error" }
                );

                return false; // ❗ important
            }

            showCustomToast("Space deleted successfully", { type: "success" });
            return true; // ✅ success
        } catch (e) {
            showCustomToast("Something went wrong", { type: "error" });
            return false;
        }
    }


    async function upload_space_files(files) {
        if (!files || files.length === 0) return;

        const formData = new FormData();
        formData.append("space_id", spaceId);

        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]); // backend should use request.FILES.getlist("files")
        }

        try {
            setUploading(true);

            const resp = await fetchWithAuth(
                `${import.meta.env.VITE_API_URL}/spaces/${spaceId}/files/upload/`,
                {
                    method: "POST",
                    body: formData, // ⚠️ NO Content-Type header here
                }
            );

            const respJson = await resp.json();

            if (!resp.ok) {
                if (resp.status === 401) {
                    // session expired
                } else {
                    showCustomToast(respJson?.detail || "Upload failed", { type: "error" });
                }
            } else {
                // Uploaded files
                respJson.uploaded_files?.forEach(file => {
                    showCustomToast(
                        <div>
                            <div className="font-bold text-sm">
                                {file.original_name.slice(0, 25)}...
                            </div>
                            <div className="text-sm">
                                Uploaded successfully
                            </div>
                        </div>,
                        { type: "success", time: 3000 }
                    );
                });

                // Rejected files
                respJson.rejected_files?.forEach(file => {
                    showCustomToast(
                        <div>
                            <div className="font-bold text-sm">
                                {file.file_name.slice(0, 25)}...
                            </div>
                            <div className="text-sm">
                                {file.reason}
                            </div>
                        </div>,
                        { type: "error", time: 3000 }
                    );
                });

                setUploadedFiles(prev => [...respJson.uploaded_files, ...prev])
            }
        } catch (error) {
            showCustomToast("Something went wrong", { type: "error" });
        } finally {
            setUploading(false);
        }
    }


    async function get_space_files() {
        try {
            const resp = await fetchWithAuth(
                `${import.meta.env.VITE_API_URL}/spaces/${spaceId}/files/`,
                {
                    method: "GET",
                }
            );

            const respJson = await resp.json();

            if (!resp.ok) {
                if (resp.status === 401) {
                    // session expired
                } else {
                    showCustomToast(respJson, { type: "error" });
                }
            } else {

                setUploadedFiles(respJson)
            }
        } catch (error) {
            showCustomToast("Something went wrong", { type: "error" });
        } finally {

        }
    }


    useEffect(() => {
        const init = async () => {
            setShowImg(false)
            await get_or_create_space()
            await get_threads_by_space(1, false)
            await get_space_files()
        }

        init()

        return () => setShowImg(true)
    }, [])

    /* Infinite scroll: load more space threads when sentinel is visible */
    useEffect(() => {
        const sentinel = spaceThreadsSentinelRef.current;
        const scrollRoot = document.querySelector("#dynamic-content-container");
        if (!sentinel || !scrollRoot) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (!entry?.isIntersecting) return;
                if (hasMoreSpaceThreads && !loadingSpaceThreads) {
                    get_threads_by_space(spaceThreadsPage + 1, true);
                }
            },
            { root: scrollRoot, rootMargin: "120px", threshold: 0 }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [spaceId, hasMoreSpaceThreads, loadingSpaceThreads, spaceThreadsPage]);


    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        // console.log("calling update...")
        update_space()
    }, [text])

    useEffect(() => {
        if (!showMoreOptions) return;

        const handleClickOutside = (event) => {
            if (
                moreOptionsRef.current &&
                !moreOptionsRef.current.contains(event.target)
            ) {
                setShowMoreOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMoreOptions]);


    const handleSave = async () => {
        setLoading(true);

        const result = await update_space();

        setLoading(false);

        if (!result.success) return;

        // SUCCESS UI updates
        showCustomToast("Settings saved successfully", { type: "success" });
        setOpenSettingsModal(false);
    };

    const handleDelete = async () => {
        setLoading(true);

        const success = await delete_space();

        setLoading(false);

        if (!success) return; // ✅ stop here if failed

        setOpenDeleteConfirmModal(false);
        setDeletedSpaceId(spaceId);

        setSpacesContainer(prev =>
            prev.filter(space => space.space_id !== spaceId)
        );

        navigate("/");
    };


    return (
        <>
            <div className="w-full min-h-screen flex flex-col">

                {/* Top Nav */}
                <div className="relative flex items-center justify-between px-7 py-3.5 border-b border-black/[0.07]">
                    <div className="flex items-center gap-2 text-sm text-stone-500 ">
                        <span className="cursor-pointer text-stone-400 hover:text-stone-600 transition-colors">Spaces</span>
                        <span className="text-stone-300">›</span>
                        <span className="text-stone-800 font-medium line-clamp-1">{spaceName}</span>
                    </div>
                    <div className=" flex items-center gap-2.5">
                        <button
                            className="bg-transparent border-none cursor-pointer text-stone-400 p-1.5 rounded-md flex items-center hover:bg-stone-200 transition-colors"
                            onClick={() => setShowMoreOptions(true)}
                        >
                            {icons.moreHoriz}
                        </button>
                        {showMoreOptions &&
                            <div ref={moreOptionsRef} className="flex flex-col absolute text-sm top-10 right-5 bg-white border border-gray-200 p-2 rounded-xl gap-2 w-48">
                                <span
                                    className="hover:bg-gray-200 p-2 rounded-md cursor-pointer"
                                    onClick={() => setOpenSettingsModal(true)}
                                ><i className="fa fa-gear mr-2"></i>Settings</span>
                                <span
                                    className="hover:bg-gray-200 p-2 rounded-md cursor-pointer"
                                    onClick={() => setOpenDeleteConfirmModal(true)}
                                ><i className="fa fa-trash mr-2"></i>Delete Space</span>
                            </div>
                        }
                        {/* <button className="flex items-center gap-1.5 bg-stone-900 text-white border-none rounded-lg px-4 py-2 text-sm  font-medium cursor-pointer tracking-wide hover:bg-stone-700 transition-colors">
                        {icons.share}
                        <span>Share</span>
                    </button> */}
                    </div>
                </div>

                {/* Main Layout */}
                <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 gap-8">

                    {/* Center Content */}
                    <div className="flex-1 pt-14 pb-10">

                        {/* Space Header */}
                        <div className="flex items-start justify-between mb-7">
                            <div className="flex flex-col gap-3">
                                <div className="relative inline-block ">
                                    {/* Folder / Emoji Badge */}
                                    <div
                                        className={`relative group cursor-pointer w-11 h-11 ${!text ? "bg-stone-200" : ""
                                            } rounded-xl flex items-center justify-center text-4xl leading-none`}
                                        onClick={() => setShowPicker(!showPicker)}
                                    >
                                        {text || icons.folder}

                                        {/* Close button */}
                                        {text && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setText("");
                                                    // update_space()
                                                }}
                                                className="
        cursor-pointer
          absolute -top-1 -right-1
          w-5 h-5 rounded-full
          bg-white border border-gray-300
          text-gray-600 text-xs
          flex items-center justify-center
          shadow
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
        "
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {showPicker && (
                                        <div className="absolute top-14 left-0 z-50 shadow-lg">
                                            <EmojiPicker
                                                onEmojiClick={(emojiData) => {
                                                    setText(emojiData.emoji);
                                                    // update_space()
                                                    setShowPicker(false);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>



                                {/* Editable Space Name */}
                                {editingName ? (
                                    <input
                                        autoFocus
                                        value={spaceName}
                                        onChange={(e) => setSpaceName(e.target.value)}
                                        onBlur={() => { setEditingName(false); update_space() }}
                                        onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                                        className="text-3xl font-normal font-serif text-stone-800 bg-transparent border-0 border-b border-stone-300 outline-none mb-2.5 block w-96 leading-snug"
                                    />
                                ) : (
                                    <h1
                                        onClick={() => setEditingName(true)}
                                        className="text-3xl font-normal font-serif text-stone-800 m-0 mb-2.5 cursor-text tracking-tight"
                                    >
                                        {spaceName}
                                    </h1>
                                )}

                                {/* Editable Description */}
                                {editingDesc ? (
                                    <input
                                        autoFocus
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        onBlur={() => { setEditingDesc(false); update_space() }}
                                        onKeyDown={(e) => e.key === "Enter" && setEditingDesc(false)}
                                        className="text-sm text-stone-400  bg-transparent border-0 border-b border-stone-300 outline-none w-96 block"
                                    />
                                ) : (
                                    <p
                                        onClick={() => setEditingDesc(true)}
                                        className="text-sm text-stone-400 m-0 cursor-text "
                                    >
                                        {description}
                                    </p>
                                )}
                            </div>

                            {/* Invite / Add buttons */}
                            {/* <div className="flex gap-2 mt-2">
                            <button className="w-8 h-8 rounded-full bg-stone-200 border-none cursor-pointer flex items-center justify-center text-stone-500 hover:bg-stone-300 transition-colors">
                                {icons.user}
                            </button>
                            <button className="w-8 h-8 rounded-full bg-stone-200 border-none cursor-pointer flex items-center justify-center text-stone-500 hover:bg-stone-300 transition-colors">
                                {icons.plus}
                            </button>
                        </div> */}
                        </div>

                        {/* Search / Query Box */}
                        <SearchForm styles={`!w-full`} spaceId={spaceId} />

                        {/* Threads Section */}
                        <div>
                            <div className="inline-flex border-b-2 border-stone-900 pb-2">
                                <div className="flex items-center gap-1.5 text-sm text-stone-800  font-medium">
                                    {icons.clock}
                                    <span>My threads</span>
                                </div>
                            </div>
                            {spaceThreads.length === 0 && !loadingSpaceThreads && (
                                <div className="border-t border-stone-200 pt-16 text-center">
                                    <p className="text-stone-400 text-sm  m-0">
                                        Your threads will appear here. Ask anything above to get started.
                                    </p>
                                </div>
                            )}
                            <ThreadsList threads={spaceThreads} styles={`divide-y divide-stone-200 border-t border-stone-200`} />
                            <div ref={spaceThreadsSentinelRef} className="h-4 flex-shrink-0" aria-hidden />
                            {loadingSpaceThreads && (
                                <p className="py-3 text-sm text-stone-400 text-center m-0">Loading more...</p>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-60 flex-shrink-0 pt-10">
                        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-5">

                            {/* Files */}
                            <div>
                                <div className="flex items-center gap-1 mb-1.5">
                                    <span className="text-sm font-semibold text-stone-800 ">Files</span>
                                    {icons.chevronRight}
                                </div>
                                <p className="text-xs text-stone-400 m-0 mb-3  leading-snug">
                                    Files to use as context for searches
                                </p>
                                {uploadedFiles.map(item => {
                                    return <p className="text-xs text-stone-400 m-0 mb-3  leading-snug truncate" key={item.id}>{item.original_name}</p>;
                                })}
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 bg-transparent hover:bg-stone-100 border-none cursor-pointer px-0.5 py-1 rounded-md text-left w-full transition-colors duration-150"
                                    >
                                        <span className="text-stone-400 flex items-center">
                                            {icons.upload}
                                        </span>
                                        <span className="text-sm text-stone-500">
                                            {uploading ? "Uploading..." : "Upload files"}
                                        </span>
                                    </button>

                                    {/* <SidebarAction icon={icons.cloud} label="Add from cloud" />
                                    <SidebarAction icon={icons.paste} label="Paste text" /> */}
                                </div>
                            </div>

                            {/* <div className="h-px bg-stone-100" /> */}

                            {/* Links */}
                            {/* <div>
                                <div className="flex items-center gap-1 mb-1.5 cursor-pointer">
                                    <span className="text-sm font-semibold text-stone-800 ">Links</span>
                                    {icons.chevronRight}
                                </div>
                                <p className="text-xs text-stone-400 m-0 mb-3  leading-snug">
                                    Websites to include in every search
                                </p>
                                <SidebarAction icon={icons.link} label="Add links" />
                            </div> */}

                            <div className="h-px bg-stone-100" />

                            {/* Add Instructions */}
                            <SidebarAction icon={icons.plus} label="Add instructions" onClick={() => setOpenSettingsModal(true)} />

                            {/* <div className="h-px bg-stone-100" /> */}

                            {/* Scheduled Tasks */}
                            {/* <SidebarAction icon={icons.calendar} label="Scheduled Tasks" /> */}
                        </div>
                    </div>
                </div>
            </div>
            <SettingsModal
                isOpen={openSettingsModal}
                onClose={() => setOpenSettingsModal(false)}
                onSave={handleSave}
                instructions={instructions}
                setInstructions={setInstructions}
                includeWeb={includeWeb}
                setIncludeWeb={setIncludeWeb}
                loading={loading}
            />
            <DeleteConfirmModal
                isOpen={openDeleteConfirmModal}
                onClose={() => setOpenDeleteConfirmModal(false)}
                onConfirm={handleDelete}
                loading={loading}
            />
            <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                    upload_space_files(e.target.files);
                    e.target.value = null; // reset input
                }}
            />
        </>
    );
}