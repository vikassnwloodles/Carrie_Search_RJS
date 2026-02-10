import React, { useEffect, useRef } from 'react'

function RightControls({
    modelDropdownRef,
    toggleMain2,
    main2DropdownOpen,
    isThreadPage,
    searchInputData,
    sourceDropdownRef,
    toggleMain3,
    main3DropdownOpen,
    attachmentDropdownRef,
    toggleMain,
    fileInputRef,
    onFileInputChange,
    mainDropdownOpen,
    onFileUploadClick,
    showConnectSubmenu,
    handleMicClick,
    micIconRef,
    searchStarted,
    setMain2DropdownOpen,
    setSearchInputData,
    setMainDropdownOpen
}) {

    // AI model change stub
    function changeAIModel(ev, model) {
        ev?.preventDefault();
        // set state or call backend as needed
        setMain2DropdownOpen(false);
        setSearchInputData((prev) => ({ ...prev, ["checkedAIModelValues"]: model }))
        localStorage.setItem("model", model)
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

                    // ✅ THIS IS REQUIRED
                    createGooglePicker();
                }
            });
    }, []);



    function createGooglePicker() {
        const token = sessionStorage.getItem("google_oauth_token");

        if (!pickerLoadedRef.current) {
            showCustomToast("Google Picker is still loading", { type: "error" });
            return;
        }

        if (!token) {
            showCustomToast("Google authentication missing", { type: "error" });
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
                    setUploadedFiles((prev) => [...prev, fileObject]);

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

    return (<>
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
                                    absolute right-0 ${isThreadPage ? "bottom-full mb-2" : "mt-2"}
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

                        {/* Claude Opus 4.6 */}
                        <button
                            type="button"
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={(e) => changeAIModel(e, "claude-opus-4_6")}
                        >
                            Claude Opus 4.6 {searchInputData.checkedAIModelValues === "claude-opus-4_6" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
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

                        {/* Grok 4.1 */}
                        <button
                            type="button"
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={(e) => changeAIModel(e, "grok-4_1")}
                        >
                            Grok 4.1 {searchInputData.checkedAIModelValues === "grok-4_1" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                        </button>

                        {/* Gemini 3 Flash */}
                        <button
                            type="button"
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={(e) => changeAIModel(e, "gemini-3-flash")}
                        >
                            Gemini 3 Flash {searchInputData.checkedAIModelValues === "gemini-3-flash" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                        </button>

                        {/* Gemini 3 Pro */}
                        <button
                            type="button"
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={(e) => changeAIModel(e, "gemini-3-pro")}
                        >
                            Gemini 3 Pro {searchInputData.checkedAIModelValues === "gemini-3-pro" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                        </button>

                        {/* Kimi K2.5 */}
                        <button
                            type="button"
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={(e) => changeAIModel(e, "kimi-k-2_5")}
                        >
                            Kimi K2.5 {searchInputData.checkedAIModelValues === "kimi-k-2_5" && <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />}
                        </button>

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
                        } absolute right-0 bg-white rounded shadow-lg z-10 ${isThreadPage ? "bottom-full mb-2" : "mt-2"}`}
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

                <input id="file-upload" ref={fileInputRef} type="file" multiple className="hidden" onChange={onFileInputChange} />

                <div id="mainDropdown" className={`${mainDropdownOpen ? "" : "hidden"} absolute right-0 w-56 bg-white rounded shadow-lg z-10 ${isThreadPage ? "bottom-full mb-2" : "mt-2"}`}>
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
    </>
    )
}

export default RightControls