import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showCustomToast } from '../utils/customToast';
import SearchSuggestionsBox from './SearchForm/SearchSuggestionsBox/SearchSuggestionsBox';
import SelectedTextContainer from './SearchForm/SelectedTextContainer';
import { fetchSearchSuggestions } from './SearchForm/SearchSuggestionsBox/fetchSearchSuggestions'
import { useFireSearch } from '../hooks/useFireSearch';
import { useSearch } from '../context/SearchContext';
import { useAuthUtils } from '../utils/useAuthUtils';
import FileMetadataBox from './SearchForm/FileMetadataBox';
import RightControls from './SearchForm/RightControls';
import { fetchWithAuth } from '../utils/fetchWithAuth';


const SearchForm = ({ isThreadPage, threadId, selectedText = "", setSelectedText, styles, spaceId=null, showSearchSuggestions=false }) => {

    const { logoutAndNavigate } = useAuthUtils();
    const {
        searchStarted,
        searchInputData,
        setSearchInputData,
    } = useSearch();
    const fireSearch = useFireSearch()

    // ================ STATES DEFINED HERE ================
    const [searchSuggestions, setSearchSuggestions] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isDragging, setIsDragging] = useState(false);

    // ================ REFS DEFINED HERE ================
    const searchBoxRef = useRef(null);

    // ================ CAPTURING TEXT FROM SEARCHBOX AS USER STARTS TYPING ================
    useEffect(() => {
        const el = searchBoxRef.current;
        if (!el) return;

        const handleInput = () => {
            setSearchQuery(el.innerText)
        };

        el.addEventListener("input", handleInput);
        return () => el.removeEventListener("input", handleInput);
    }, []);


    // ================ CALLING `fetchSearchSuggestions` API AS USER STARTS TYPING ================
    useEffect(() => {
        if (!searchQuery || isThreadPage || searchQuery.length > 100 || !showSearchSuggestions) {
            setSearchSuggestions([]);
            return;
        }
        let isLatest = true;
        (async () => {
            const suggestions = await fetchSearchSuggestions(searchQuery, 6)
            if (isLatest) setSearchSuggestions(suggestions)
        })();
        return () => isLatest = false
    }, [searchQuery, isThreadPage]);


    const allowedMimeTypes = [
        // Documents
        "application/pdf",
        "text/plain",
        "text/csv",

        // Word / Excel / PowerPoint
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",

        // Images
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp",

        // Google-native (important!)
        "application/vnd.google-apps.document",
        "application/vnd.google-apps.spreadsheet",
        "application/vnd.google-apps.presentation"
    ];


    const [uploadedFiles, setUploadedFiles] = useState([]);

    const pickerLoadedRef = useRef(false);

    useEffect(() => {
        if (!window.gapi) return;

        window.gapi.load("picker", {
            callback: () => {
                pickerLoadedRef.current = true;
            },
            onerror: () => {
                console.error("❌ Failed to load Google Picker");
            }
        });
    }, []);

    // Helper to map MIME type to file extension
    const getExtensionFromMime = function (mime) {
        if (!mime) return '';

        if (mime === 'text/plain') return '.txt';
        if (mime === 'application/pdf') return '.pdf';

        if (mime.includes('wordprocessingml') || mime.includes('msword')) return '.docx';
        if (mime.includes('spreadsheetml') || mime.includes('excel')) return '.xlsx';
        if (mime === 'text/csv') return '.csv';
        if (mime.includes('presentationml') || mime.includes('powerpoint')) return '.pptx';

        // Google native formats → export targets
        if (mime === 'application/vnd.google-apps.document') return '.docx';
        if (mime === 'application/vnd.google-apps.spreadsheet') return '.xlsx';
        if (mime === 'application/vnd.google-apps.presentation') return '.pptx';

        return '';
    }

    const pickerCallback = async (data) => {
        if (data.action !== window.google.picker.Action.PICKED) return;

        const file = data.docs[0];
        const accessToken = sessionStorage.getItem("google_oauth_token");

        if (!allowedMimeTypes.includes(file.mimeType)) {
            showCustomToast(
                "Only PDF, DOCX, TXT, XLSX, CSV and image files are allowed",
                { type: "warning" }
            );
            return;
        }

        let fetchUrl;
        let extension = getExtensionFromMime(file.mimeType);

        if (file.mimeType.startsWith("application/vnd.google-apps.")) {
            let exportMime = "application/pdf";

            if (file.mimeType.includes("document"))
                exportMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            else if (file.mimeType.includes("spreadsheet"))
                exportMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            else if (file.mimeType.includes("presentation"))
                exportMime = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

            fetchUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${exportMime}`;
        } else {
            fetchUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
        }

        try {
            const res = await fetchWithAuth(fetchUrl, {
                headers: {  }
            });

            const blob = await res.blob();

            let finalName = file.name;
            if (extension && !finalName.toLowerCase().endsWith(extension)) {
                finalName += extension;
            }

            const fileObject = new File([blob], finalName, {
                type: blob.type || file.mimeType
            });

            setUploadedFiles((prev) => [...prev, fileObject]);

            sessionStorage.setItem("uploadType", "local");
            sessionStorage.setItem("uploadTypeURL", file.url);
            sessionStorage.setItem(
                "isUploadTypeURLImage",
                file.mimeType?.startsWith("image/")
            );

        } catch (err) {
            console.error("Error fetching Drive file:", err);
            showCustomToast("Failed to fetch Google Drive file", { type: "error" });
        }
    };



    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    // Refs & state
    const modelDropdownRef = useRef(null);
    const sourceDropdownRef = useRef(null);
    const attachmentDropdownRef = useRef(null);
    const fileInputRef = useRef(null);
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
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/upload-image/`, {
                method: 'POST',
                headers: {

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
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/upload-doc/`, {
                method: 'POST',
                headers: {

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
        setSearchSuggestions([])
        let text = normalizePrompt(searchBoxRef.current.innerText);

        if (!text) {
            return;
        }
        if (!isAuthenticated) {
            showCustomToast("Login Required!", { type: "error" })
            return
        }

        // ✅ CLEAR SELECTED FILE METADATA BOX
        closeUploadedFileMetadata()

        if (setSelectedText) setSelectedText("")

        // ✅ CLEAR SEARCH BOX
        searchBoxRef.current.innerHTML = "";

        // VALIDATE SELECTED FILES AND CALL UPLOAD API
        let uploadedImages = [];
        let uploadedDocs = [];

        if (uploadedFiles && uploadedFiles.length > 0) {
            for (const file of uploadedFiles) {
                if (file.type.startsWith("image/")) {
                    // CALL UPLOAD IMAGE API
                    // try {
                    //     const imageUrl = await callUploadImageApi(file);
                    //     uploadedImages.push(imageUrl);
                    // } catch (err) {
                    //     console.error("Image upload failed:", file.name, err);
                    // }
                } else if (
                    file.type !== "application/pdf" &&
                    file.type !== "text/plain" &&
                    file.type !== "text/csv" &&
                    file.type !==
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
                    file.type !==
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
                    file.type !==
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                ) {
                    showCustomToast(
                        `File "${file.name}" is not allowed. Only PDF, DOCX, TXT, XLSX, CSV, and image files are accepted.`,
                        { type: "warn", title: "Invalid File Type" }
                    );
                } else {
                    // CALL UPLOAD DOC API
                    // try {
                    //     const docContent = await callUploadDocApi(file);
                    //     uploadedDocs.push({ name: file.name, content: docContent });
                    // } catch (err) {
                    //     console.error("Doc upload failed:", file.name, err);
                    // }
                }
            }
        }

        // uploadedImages -> array of uploaded image URLs
        // uploadedDocs   -> array of objects: { name, content }
        // let extractedText = ""
        // let i = 0
        // for (let uploadedDoc of uploadedDocs) {
        //     i += 1
        //     extractedText += `# Attached Doc ${i}\n## Doc Metadata\nDoc Name: ${uploadedDoc.name}\n## Doc Content\n${uploadedDoc.content}\n\n---\n\n`
        // }
        // if (extractedText) text = `${extractedText}# User Query\n${text}`
        if (isThreadPage) {
            // fireSearch(searchQuery, null, threadId, imageUrl, docContent)
            await fireSearch(text, null, threadId, false, uploadedFiles, selectedText, spaceId)
        } else {
            const newThreadId = crypto.randomUUID();
            // setSearchInputData(prev => ({...prev, thread_id: newThreadId}))
            navigate(`/thread/${newThreadId}`, { state: { shouldFetchThread: false } })
            await fireSearch(text, null, newThreadId, true, uploadedFiles, null, spaceId)
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
        const files = Array.from(e.target.files)
        if (!files) return;
        // setUploadedFile({
        //     name: f.name,
        //     size: f.size,
        //     type: f.type,
        // });
        setUploadedFiles((prev) => [...prev, ...files]);
    }


    // 🔥 DRAG & DROP HANDLER
    function handleDrop(e) {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (!files || files.length === 0) return;

        const validFiles = [];

        for (const file of files) {
            if (!allowedMimeTypes.includes(file.type)) {
                showCustomToast(
                    `File "${file.name}" is not allowed.`,
                    { type: "warn", title: "Invalid File Type" }
                );
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            setUploadedFiles(prev => [...prev, ...validFiles]);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e) {
        e.preventDefault();
        setIsDragging(false);
    }


    function closeUploadedFileMetadata() {
        setUploadedFiles([]);
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
        const el = searchBoxRef.current;
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
            if (searchBoxRef.current) {
                searchBoxRef.current.setAttribute("data-placeholder", "Listening...");
            }
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (searchBoxRef.current) {
                searchBoxRef.current.innerText = transcript;
                placeCaretAtEnd(searchBoxRef.current);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            if (micIconRef.current) {
                micIconRef.current.classList.remove("text-red-500");
                micIconRef.current.classList.add("text-gray-500");
            }
            if (searchBoxRef.current) {
                searchBoxRef.current.setAttribute(
                    "data-placeholder",
                    "Search, Ask, or Write Anything!"
                );
            }
        };

        recognition.onerror = () => {
            setIsListening(false);
            if (searchBoxRef.current) {
                searchBoxRef.current.setAttribute(
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
            if (searchBoxRef.current) {
                searchBoxRef.current.setAttribute(
                    "data-placeholder",
                    "Microphone already active or permission denied."
                );
                setTimeout(() => {
                    searchBoxRef.current.setAttribute(
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


    const handlePaste = (e) => {
        e.preventDefault();

        const clipboard = e.clipboardData;
        const html = clipboard.getData("text/html");
        const text = clipboard.getData("text/plain");

        // If a link was copied → extract href
        if (html) {
            const doc = new DOMParser().parseFromString(html, "text/html");
            const anchor = doc.querySelector("a[href]");

            if (anchor?.href) {
                document.execCommand("insertText", false, anchor.href);
                setSearchQuery(prev => prev + anchor.href);
                return;
            }
        }

        // Fallback: normal text
        document.execCommand("insertText", false, text);
        setSearchQuery(prev => prev + text);
    };



    return (
        <>
            {/* Search form */}
            <form
                id="search-form"
                // className="z-10 w-full max-w-4xl pb-12 bg-[#fcfcf9] rounded-xl"
                className={`z-10 ${true ? "" : "w-full"} max-w-4xl pb-12 rounded-xl ${isThreadPage ? "fixed -bottom-5 !w-full" : ""}`}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchSubmit();
                }}
            >
                <div className={`relative flex items-center rounded-xl ${isThreadPage ? "!w-full !left-0" : ""} ${styles}`} id="search-width">
                    <div
                        id="searchbox_parent_div"
                        // className={`w-full border border-gray-200 rounded-xl p-2 pb-12 bg-white shadow-sm transition-shadow focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-500`}
                        className={`w-full border border-gray-200 ${searchSuggestions && searchSuggestions.length > 0 ? "rounded-t-xl" : "rounded-xl"}  p-2 pb-12 bg-white shadow-sm transition-shadow focus-within:outline-none focus-within:ring-2 focus-within:ring-[#652F74]`}
                        onMouseDown={(e) => {
                            const el = searchBoxRef.current;
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
                            ref={searchBoxRef}
                            onPaste={handlePaste}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            suppressContentEditableWarning
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
                                ${(selectedText.trim() && uploadedFiles.length > 0) ? "pt-40" : (selectedText.trim() ? "pt-20" : (uploadedFiles.length > 0 ? "pt-20" : "pt-2"))}
                                `}

                            style={{ minHeight: "60px" }}
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
                        className={`absolute top-0 left-0 z-10
                                    flex flex-col gap-2
                                    p-2 rounded-t-xl max-w-full
                                `}
                    >
                        {isThreadPage && selectedText.trim() && <SelectedTextContainer selectedText={selectedText} setSelectedText={setSelectedText} />}

                        <FileMetadataBox
                            uploadedFiles={uploadedFiles}
                            setUploadedFiles={setUploadedFiles}
                        />
                    </div>
                    <RightControls
                        modelDropdownRef={modelDropdownRef}
                        toggleMain2={toggleMain2}
                        main2DropdownOpen={main2DropdownOpen}
                        isThreadPage={isThreadPage}
                        searchInputData={searchInputData}
                        sourceDropdownRef={sourceDropdownRef}
                        toggleMain3={toggleMain3}
                        main3DropdownOpen={main3DropdownOpen}
                        attachmentDropdownRef={attachmentDropdownRef}
                        toggleMain={toggleMain}
                        fileInputRef={fileInputRef}
                        onFileInputChange={onFileInputChange}
                        mainDropdownOpen={mainDropdownOpen}
                        onFileUploadClick={onFileUploadClick}
                        showConnectSubmenu={showConnectSubmenu}
                        handleMicClick={handleMicClick}
                        micIconRef={micIconRef}
                        searchStarted={searchStarted}
                        setMain2DropdownOpen={setMain2DropdownOpen}
                        setSearchInputData={setSearchInputData}
                        setMainDropdownOpen={setMainDropdownOpen}
                        setShowConnectSubmenu={setShowConnectSubmenu}
                    />
                </div >
                <SearchSuggestionsBox
                    ref={searchBoxRef}
                    searchSuggestions={searchSuggestions}
                    mt={1}
                    handleSearchSubmit={handleSearchSubmit}
                />
            </form >
        </>
    )
}

export default SearchForm