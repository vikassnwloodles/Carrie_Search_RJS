import { forwardRef, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showCustomToast } from '../utils/customToast';

const SearchForm = forwardRef(({ searchStarted, threadId, setThreadId, fireSearch, searchInputData, setSearchInputData, threadsContainer, setThreadsContainer, setShouldFetchThread }, ref) => {

    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    // Refs & state
    const modelDropdownRef = useRef(null);
    const sourceDropdownRef = useRef(null);
    const attachmentDropdownRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showFileMetadata, setShowFileMetadata] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [main2DropdownOpen, setMain2DropdownOpen] = useState(false);
    const [main3DropdownOpen, setMain3DropdownOpen] = useState(false);
    const [mainDropdownOpen, setMainDropdownOpen] = useState(false);
    const micIconRef = useRef(null);
    const recognitionRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [showConnectSubmenu, setShowConnectSubmenu] = useState(false);


    function normalizePrompt(text) {
        return text
            .replace(/\u00A0/g, " ")
            .replace(/\n+$/, "")
            .trim();
    }


    // CALL UPLOAD IMAGE API FUNCTION
    async function callUploadImageApi(uploadedFile) {
        try {
            const formData = new FormData();
            formData.append("image", uploadedFile);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/upload-image/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            })

            const resJson = await res.json()
            if (!res.ok) {
                if (res.status === 401) {
                    showCustomToast("Session expired. Please log in again.", {
                        type: "warn",
                    });
                    logoutAndNavigate();
                } else {
                    showCustomToast(resJson, { type: "error" });
                }
            } else {
                return resJson.image_url
            }
        } catch (err) {
            console.error(err);
            showCustomToast({ message: "Something went wrong" }, { type: "error" });
        }
    }


    // CALL UPLOAD DOC API FUNCTION
    async function callUploadDocApi(uploadedFile) {
        try {
            const formData = new FormData();
            formData.append("file", uploadedFile);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/upload-doc/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            })

            const resJson = await res.json()
            if (!res.ok) {
                if (res.status === 401) {
                    showCustomToast("Session expired. Please log in again.", {
                        type: "warn",
                    });
                    logoutAndNavigate();
                } else {
                    showCustomToast(resJson, { type: "error" });
                }
            } else {
                return resJson.text_content
            }
        } catch (err) {
            console.error(err);
            showCustomToast({ message: "Something went wrong" }, { type: "error" });
        }
    }


    async function handleSearchSubmit() {
        const text = normalizePrompt(ref.current.innerText);
        if (!text) {
            return;
        }
        if (!isAuthenticated) {
            showCustomToast("Login Required!", { type: "error" })
            return
        }

        // ✅ CLEAR SELECTED FILE METADATA BOX
        closeUploadedFileMetadata()

        // ✅ CLEAR SEARCH BOX
        ref.current.innerHTML = "";

        // VALIDATE SELECTED FILE AND CALL UPLOAD IMAGE API
        let imageUrl = "";
        let docContent = "";
        if (uploadedFile) {
            if (uploadedFile?.type.startsWith("image/")) {
                // CALL UPLOAD IMAGE API
                imageUrl = await callUploadImageApi(uploadedFile)
            } else if (
                uploadedFile?.type !== "application/pdf" &&
                uploadedFile?.type !== "text/plain" &&
                uploadedFile?.type !== "text/csv" &&
                uploadedFile?.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
                uploadedFile?.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
                uploadedFile?.type !== "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            ) {

                showCustomToast("Only PDF, DOCX, TXT, XLSX, CSV and image files are allowed.", { type: "warn", title: "Invalid File Type" })
                return
            } else {
                // CALL UPLOAD DOC API
                docContent = await callUploadDocApi(uploadedFile)
            }
        }

        if (threadId) {
            fireSearch(text, null, threadId, imageUrl, docContent)
        } else {
            const newThreadId = crypto.randomUUID();
            setThreadId(newThreadId)
            setShouldFetchThread(false)
            window.history.replaceState({}, "", `/search/${newThreadId}`);
            const resJson = await fireSearch(text, null, newThreadId, imageUrl, docContent)
            setThreadsContainer([{ ...resJson, thread_id: newThreadId, prompt: text }, ...threadsContainer])
        }
    }

    // File upload handlers
    function onFileUploadClick() {
        fileInputRef.current?.click();
        setMainDropdownOpen(false)
    }

    // Bind handlers that were previously attached by calling bindFileUploadHandler/bindSearchHandler
    // useEffect(() => {
    //     // mimic bindFileUploadHandler: attaches click listeners
    //     const fileUploadBtn = document.getElementById("file-upload-button");
    //     if (fileUploadBtn) {
    //         fileUploadBtn.addEventListener("click", onFileUploadClick);
    //     }
    //     // cleanup
    //     return () => {
    //         if (fileUploadBtn) fileUploadBtn.removeEventListener("click", onFileUploadClick);
    //     };
    // }, []);

    // AI model change stub
    function changeAIModel(ev, model) {
        ev?.preventDefault();
        // set state or call backend as needed
        setMain2DropdownOpen(false);
        setSearchInputData((prev) => ({ ...prev, ["checkedAIModelValues"]: model }))
        localStorage.setItem("model", model)
    }

    // Helpers originally from inline JS
    function autoCleanContentEditable(el) {
        // simple cleanup: remove consecutive spaces at start and trailing newlines
        if (!el) return;
        let txt = el.innerText || "";
        // replace non-breaking spaces, trim trailing newlines
        txt = txt.replace(/\u00A0/g, " ").replace(/\s+$/g, "");
        // Preserve basic line breaks — convert to text with line breaks
        el.innerText = txt;
        placeCaretAtEnd(el);
    }

    function placeCaretAtEnd(el) {
        if (!el) return;
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // Toggle helpers to close others when opening one
    function toggleMain2() {
        setMain2DropdownOpen((v) => !v);
        setMain3DropdownOpen(false);
        setMainDropdownOpen(false);
    }

    function toggleMain3() {
        setMain3DropdownOpen((v) => !v);
        setMain2DropdownOpen(false);
        setMainDropdownOpen(false);
    }

    function toggleMain() {
        setMainDropdownOpen((v) => !v);
        setMain2DropdownOpen(false);
        setMain3DropdownOpen(false);
    }

    function onFileInputChange(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        // setUploadedFile({
        //     name: f.name,
        //     size: f.size,
        //     type: f.type,
        // });
        setUploadedFile(f);
        setShowFileMetadata(true);
    }

    function closeUploadedFileMetadata() {
        setUploadedFile(null);
        setShowFileMetadata(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleKeyDownOnSearchBox(e) {
        // Enter to submit (Shift+Enter for newline)
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSearchSubmit();
        }
    }

    // keep contenteditable autosize in sync when content changes
    function autoGrowSearchBox(el) {
        if (!el) return;
        // We use scrollHeight to allow content to grow; set max-height via css (already present)
        el.style.height = "auto";
        const newH = Math.min(el.scrollHeight, window.innerHeight * 0.4);
        // el.style.height = `${newH}px`;
    }
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        function onInput() {
            if (el.innerHTML === "<br>" || el.innerHTML === "\n") {
                el.innerHTML = "";
            }
            autoGrowSearchBox(el); // ONLY layout logic here
        }

        el.addEventListener("input", onInput);
        return () => el.removeEventListener("input", onInput);
    }, []);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                modelDropdownRef.current &&
                !modelDropdownRef.current.contains(e.target)
            ) {
                setMain2DropdownOpen(false);
            }

            if (
                sourceDropdownRef.current &&
                !sourceDropdownRef.current.contains(e.target)
            ) {
                setMain3DropdownOpen(false);
            }

            if (
                attachmentDropdownRef.current &&
                !attachmentDropdownRef.current.contains(e.target)
            ) {
                setMainDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsListening(true);
            if (micIconRef.current) {
                micIconRef.current.classList.remove("text-gray-500");
                micIconRef.current.classList.add("text-red-500");
            }
            if (ref.current) {
                ref.current.setAttribute("data-placeholder", "Listening...");
            }
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (ref.current) {
                ref.current.innerText = transcript;
                placeCaretAtEnd(ref.current);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            if (micIconRef.current) {
                micIconRef.current.classList.remove("text-red-500");
                micIconRef.current.classList.add("text-gray-500");
            }
            if (ref.current) {
                ref.current.setAttribute(
                    "data-placeholder",
                    "Search, Ask, or Write Anything!"
                );
            }
        };

        recognition.onerror = () => {
            setIsListening(false);
            if (ref.current) {
                ref.current.setAttribute(
                    "data-placeholder",
                    "Speech recognition failed. Try typing."
                );
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);


    function handleMicClick() {
        if (!recognitionRef.current) return;

        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Mic already active or permission denied", e);
            if (ref.current) {
                ref.current.setAttribute(
                    "data-placeholder",
                    "Microphone already active or permission denied."
                );
                setTimeout(() => {
                    ref.current.setAttribute(
                        "data-placeholder",
                        "Search, Ask, or Write Anything!"
                    );
                }, 3000);
            }
        }
    }


    function redirectURLExternal(url) {
        window.open(url, "_blank", "noopener,noreferrer");
    }


    /* ---------------- GOOGLE DRIVE ---------------- */

    /* ---------------- GOOGLE DRIVE AUTH ---------------- */

    const googleTokenClientRef = useRef(null);

    useEffect(() => {
        if (!window.google || !window.google.accounts?.oauth2) {
            console.warn("Google OAuth not loaded yet");
            return;
        }

        googleTokenClientRef.current =
            window.google.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                scope: "https://www.googleapis.com/auth/drive.readonly",
                callback: (tokenResponse) => {
                    sessionStorage.setItem(
                        "google_oauth_token",
                        tokenResponse.access_token
                    );
                    console.log("Google Drive authenticated");
                }
            });
    }, []);



    function createGooglePicker() {
        const token = sessionStorage.getItem("google_oauth_token");

        if (!window.google?.picker || !token) {
            showCustomToast("Google Picker not ready", { type: "error" });
            return;
        }

        const picker = new window.google.picker.PickerBuilder()
            .addView(window.google.picker.ViewId.DOCS)
            .setOAuthToken(token)
            .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY)
            .setCallback(pickerCallback)
            .build();

        picker.setVisible(true);
    }


    async function handleGoogleDriveClick() {
        setMainDropdownOpen(false);

        if (!window.google || !window.gapi) {
            showCustomToast("Google Drive API not loaded", { type: "error" });
            return;
        }

        const token = sessionStorage.getItem("google_oauth_token");

        if (!token) {
            googleTokenClientRef.current.requestAccessToken();
            return;
        }

        createGooglePicker();
    }



    /* ---------------- DROPBOX ---------------- */

    function handleDropboxClick() {
        setMainDropdownOpen(false);

        if (!window.Dropbox) {
            showCustomToast("Dropbox SDK not loaded", { type: "error" });
            return;
        }

        window.Dropbox.choose({
            linkType: "direct",
            multiselect: false,

            success: async (files) => {
                const file = files[0];

                try {
                    const res = await fetch(file.link);
                    const blob = await res.blob();

                    const fileObject = new File(
                        [blob],
                        file.name,
                        { type: blob.type || "application/octet-stream" }
                    );

                    // 🔹 Attach file to input
                    const dt = new DataTransfer();
                    dt.items.add(fileObject);
                    fileInputRef.current.files = dt.files;

                    // 🔹 Update UI
                    setUploadedFile(fileObject);
                    setShowFileMetadata(true);

                } catch (err) {
                    console.error(err);
                    showCustomToast("Failed to fetch Dropbox file", { type: "error" });
                }
            },

            cancel: () => {
                console.log("Dropbox picker closed");
            }
        });
    }




    return (
        <>
            {/* Search form */}
            <form
                id="search-form"
                // className="z-10 w-full max-w-4xl pb-12 bg-[#fcfcf9] rounded-xl"
                className={`z-10 ${true ? "" : "w-full"} max-w-4xl pb-12 rounded-xl ${threadId ? "fixed -bottom-5 !w-full" : ""}`}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchSubmit();
                }}
            >
                <div className={`relative flex items-center rounded-xl ${threadId ? "!w-full !left-0" : ""}`} id="search-width">
                    <div
                        id="searchbox_parent_div"
                        className="w-full border border-gray-200 rounded-xl p-2 pb-12 bg-white shadow-sm transition-shadow focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-500"
                        onMouseDown={(e) => {
                            const el = ref.current;
                            if (!el) return;

                            // If user clicks inside existing text → DO NOTHING
                            if (e.target !== el) return;

                            // If empty → allow caret at end
                            if (el.innerText.trim() === "") {
                                e.preventDefault(); // stop browser default
                                el.focus();
                                placeCaretAtEnd(el);
                            }
                        }}
                    >
                        <div
                            id="ai_search"
                            ref={ref}
                            contentEditable={true}
                            data-placeholder="Search, Ask, or Write Anything!"
                            name="prompt"
                            // onInput={captureSearchInputData}
                            onKeyDown={handleKeyDownOnSearchBox}
                            // input handled by useEffect attaching 'input'
                            // className="max-h-[40vh] resize-none w-full rounded-xl pt-2 pl-16 pr-32 md:pl-20 md:pr-40 text-lg bg-white focus:outline-none transition-shadow whitespace-pre-wrap overflow-y-auto"
                            className={`
                                max-h-[40vh] resize-none w-full rounded-xl
                                pl-16 pr-32 md:pl-20 md:pr-40
                                text-lg bg-white focus:outline-none
                                whitespace-pre-wrap overflow-y-auto
                                transition-all
                                ${showFileMetadata ? "pt-20" : "pt-2"}
                                `}

                            style={{ minHeight: "50px" }}
                        />
                    </div>

                    <div className="absolute left-4 flex items-center space-x-1 sm:space-x-2" />

                    {/* File metadata box */}
                    {/* <div
                        id="file-metadata-box"
                        className={`top-3 left-3 absolute p-2 ml-3 bg-white border border-gray-300 rounded-xl shadow-sm ${showFileMetadata ? "" : "hidden"
                            }`}
                    >
                        <div style={{ float: "left" }}>
                            <div className="bg-teal-600 rounded-md w-10 h-10 flex items-center justify-center">
                                <i id="uploaded-file-icon" className="fas fa-file-pdf text-white text-2xl" />
                            </div>
                        </div>

                        <div style={{ float: "left", marginLeft: 10, marginRight: 10 }}>
                            <div className="text-xs text-gray-500 font-bold" id="uploaded_filename">
                                {uploadedFile?.name ?? "test.pdf"}
                            </div>
                            <div className="text-xs text-gray-500" id="uploaded_filesize">
                                {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : "52.5 KB"}
                            </div>
                        </div>

                        <button
                            type="button"
                            id="close_uploaded_file_metadata_box"
                            style={{ float: "left" }}
                            onClick={closeUploadedFileMetadata}
                        >
                            <i className="fas fa-times text-gray-600 text-base" />
                        </button>
                    </div> */}
                    <div
                        id="file-metadata-box"
                        className={`absolute top-3 left-3 z-10
                            flex items-center gap-3
                            p-2 bg-white border border-gray-300
                            rounded-xl shadow-sm
                            ${showFileMetadata ? "" : "hidden"}
                        `}
                    >
                        <div className="bg-teal-600 rounded-md w-10 h-10 flex items-center justify-center shrink-0">
                            {uploadedFile?.type === "application/pdf" ?
                                <i className="fas fa-file-pdf text-white text-xl" />
                                : uploadedFile?.type === "text/plain" ?
                                    <i className="fas fa-file-lines text-white text-xl" />
                                    : uploadedFile?.type === "text/csv" ?
                                        <i className="fas fa-file-csv text-white text-xl" />
                                        : uploadedFile?.type.startsWith("image/") ?
                                            <i className="fas fa-file-image text-white text-xl" />
                                            : uploadedFile?.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ?
                                                <i className="fas fa-file-word text-white text-xl" />
                                                : uploadedFile?.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ?
                                                    <i className="fas fa-file-excel text-white text-xl" />
                                                    : uploadedFile?.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ?
                                                        <i className="fas fa-file-powerpoint text-white text-xl" />
                                                        : <i className="fas fa-file text-white text-xl" />
                            }
                        </div>

                        <div className="min-w-0">
                            <div className="text-xs text-gray-700 font-semibold truncate max-w-[180px]">
                                {uploadedFile?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                                {(uploadedFile?.size / 1024).toFixed(1)} KB
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={closeUploadedFileMetadata}
                            className="text-gray-500 hover:text-gray-800"
                        >
                            <i className="fas fa-times" />
                        </button>
                    </div>


                    {/* Right controls */}
                    <div className="absolute right-4 flex items-center space-x-1 sm:space-x-2">
                        {/* AI model dropdown */}
                        <div className="relative inline-block" ref={modelDropdownRef}>
                            <button
                                type="button"
                                id="dropdown2Button"
                                className="text-gray-500 hover:text-black p-1 sm:p-2"
                                onClick={toggleMain2}
                            >
                                <i className="fa fa-microchip text-base sm:text-xl" />
                            </button>

                            <div
                                id="main2Dropdown"
                                className={`${main2DropdownOpen ? "" : "hidden"}
                                    absolute right-0 ${threadId ? "bottom-full mb-2" : "mt-2"}
                                    w-56 bg-white rounded shadow-lg z-[9999]
                                `}
                            >
                                <div className="p-1">
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={(e) => changeAIModel(e, "best")}
                                    >
                                        Best {searchInputData.checkedAIModelValues === "best" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                                    </button>

                                    {/* GPT 5.2 */}
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={(e) => changeAIModel(e, "gpt-5_2")}
                                    >
                                        GPT-5.2 {searchInputData.checkedAIModelValues === "gpt-5_2" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                                    </button>

                                    {/* Claude Opus 4.5 */}
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={(e) => changeAIModel(e, "claude-opus-4_5")}
                                    >
                                        Claude Opus 4.5 {searchInputData.checkedAIModelValues === "claude-opus-4_5" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                                    </button>

                                    {/* Claude Sonnet 4.5 */}
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={(e) => changeAIModel(e, "claude-sonnet-4_5")}
                                    >
                                        Claude Sonnet 4.5 {searchInputData.checkedAIModelValues === "claude-sonnet-4_5" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                                    </button>

                                    {/* DeepSeek */}
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={(e) => changeAIModel(e, "deepseek")}
                                    >
                                        DeepSeek {searchInputData.checkedAIModelValues === "deepseek" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                                    </button>

                                    {/* <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={(e) => changeAIModel(e, "sonar")}
                                    >
                                        Sonar {searchInputData.checkedAIModelValues === "sonar" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={(e) => changeAIModel(e, "sonar-pro")}
                                    >
                                        Sonar Pro {searchInputData.checkedAIModelValues === "sonar-pro" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={(e) => changeAIModel(e, "sonar-reasoning")}
                                    >
                                        Sonar Reasoning {searchInputData.checkedAIModelValues === "sonar-reasoning" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={(e) => changeAIModel(e, "sonar-reasoning-pro")}
                                    >
                                        Sonar Reasoning Pro {searchInputData.checkedAIModelValues === "sonar-reasoning-pro" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={(e) => changeAIModel(e, "sonar-deep-research")}
                                    >
                                        Sonar Deep Research {searchInputData.checkedAIModelValues === "sonar-deep-research" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                                    </button> */}
                                </div>
                            </div>
                        </div>

                        {/* Source dropdown */}
                        <div className="relative inline-block" ref={sourceDropdownRef}>
                            <button
                                type="button"
                                id="dropdown3Button"
                                className="text-gray-500 hover:text-black p-1 sm:p-2"
                                onClick={toggleMain3}
                            >
                                <i className="fa fa fa-database text-base sm:text-xl" />
                            </button>

                            <div
                                id="main3Dropdown"
                                className={`${main3DropdownOpen ? "" : "hidden"
                                    } absolute right-0 bg-white rounded shadow-lg z-10 ${threadId ? "bottom-full mb-2" : "mt-2"}`}
                                style={{ width: 300 }}
                            >
                                <div className="p-3">
                                    <div className="relative">
                                        <span>
                                            <i className="fa-solid fa-globe mr-2" /> Web <br />
                                        </span>
                                        <span style={{ fontSize: "0.8rem" }}>Search across the entire internet</span>

                                        <div className="relative inline-block w-11 h-5 float-right">
                                            <input
                                                id="source-web"
                                                type="radio"
                                                name="source"
                                                value="web"
                                                defaultChecked
                                                onChange={() => console.log("source: web")}
                                                className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-blue-600 cursor-pointer transition-colors duration-300"
                                            />
                                            <label
                                                htmlFor="source-web"
                                                className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-blue-600 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3">
                                    <div className="relative">
                                        <span>
                                            <i className="fa-solid fa-graduation-cap mr-2" /> Academic <br />
                                        </span>
                                        <span style={{ fontSize: "0.8rem" }}>Search academic papers</span>

                                        <div className="relative inline-block w-11 h-5 float-right">
                                            <input
                                                id="source-academic"
                                                type="radio"
                                                name="source"
                                                value="academic"
                                                onChange={() => console.log("source: academic")}
                                                className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-blue-600 cursor-pointer transition-colors duration-300"
                                            />
                                            <label
                                                htmlFor="source-academic"
                                                className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-blue-600 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3">
                                    <div className="relative">
                                        <span>
                                            <i className="fa-solid fa-store mr-2" /> Finance <br />
                                        </span>
                                        <span style={{ fontSize: "0.8rem" }}>Search SEC Filings</span>

                                        <div className="relative inline-block w-11 h-5 float-right">
                                            <input
                                                id="source-finance"
                                                type="radio"
                                                name="source"
                                                value="sec"
                                                onChange={() => console.log("source: sec")}
                                                className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-blue-600 cursor-pointer transition-colors duration-300"
                                            />
                                            <label
                                                htmlFor="source-finance"
                                                className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-blue-600 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attachments dropdown */}
                        <div className="relative inline-block" ref={attachmentDropdownRef}>
                            <button
                                type="button"
                                id="dropdownButton"
                                className="text-gray-500 hover:text-black p-1 sm:p-2"
                                onClick={toggleMain}
                            >
                                <i className="fas fa-paperclip text-base sm:text-xl" />
                            </button>

                            <input id="file-upload" ref={fileInputRef} type="file" className="hidden" onChange={onFileInputChange} />

                            <div id="mainDropdown" className={`${mainDropdownOpen ? "" : "hidden"} absolute right-0 w-56 bg-white rounded shadow-lg z-10 ${threadId ? "bottom-full mb-2" : "mt-2"}`}>
                                <div className="p-1">
                                    <button type="button" id="file-upload-button" className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={onFileUploadClick}>
                                        <i className="fa-regular fa-file mr-2" /> Local files
                                    </button>

                                    <div
                                        className="relative"
                                        onMouseEnter={() => setShowConnectSubmenu(true)}
                                        onMouseLeave={() => setShowConnectSubmenu(false)}
                                    >
                                        {/* CONNECT FILES BUTTON */}
                                        <button
                                            type="button"
                                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            <span>
                                                <i className="fa-solid fa-share-nodes mr-2" /> Connect files
                                            </span>
                                            <i className="fa fa-angle-right text-gray-500 float-right" />
                                        </button>

                                        {/* SUBMENU */}
                                        {showConnectSubmenu && (
                                            <div
                                                id="submenu2"
                                                className="absolute top-0 left-full bg-white rounded shadow-lg w-[225px] z-50"
                                            >
                                                <button
                                                    type="button"
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                                    onClick={handleGoogleDriveClick}
                                                >
                                                    <i className="fa-brands fa-google-drive mr-2" />
                                                    Google Drive
                                                </button>

                                                <button
                                                    type="button"
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                                    onClick={handleDropboxClick}
                                                >
                                                    <i className="fa-brands fa-dropbox mr-2" />
                                                    Dropbox
                                                </button>

                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Mic button */}
                        {/* <button type="button" id="mic-button" className="text-gray-500 hover:text-black p-1 sm:p-2" onClick={() => console.log("mic clicked")}>
                            <i className="fa-solid fa-microphone-lines text-base sm:text-xl" id="mic-icon" />
                        </button> */}
                        <button
                            type="button"
                            id="mic-button"
                            onClick={handleMicClick}
                            className="text-gray-500 hover:text-black p-1 sm:p-2"
                        >
                            <i
                                ref={micIconRef}
                                id="mic-icon"
                                className="fa-solid fa-microphone-lines text-base sm:text-xl text-gray-500"
                            />
                        </button>

                        {/* Submit */}
                        <button
                            disabled={searchStarted}
                            type="submit"
                            id="search-form-btn"
                            className="bg-teal-600 text-white rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-teal-700 transition-colors"
                        >
                            <i className={`fas ${searchStarted ? "fa-stop" : "fa-arrow-right"} text-base sm:text-xl`} />
                        </button>
                    </div>
                </div >
            </form >
        </>
    )
})

export default SearchForm