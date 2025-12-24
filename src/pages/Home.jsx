// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ResetPasswordModal from "../components/ResetPasswordModal";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";
import { useAuth } from "../context/AuthContext";
import SearchResult from "../components/SearchResultContainer";

export default function Home({ setShowImg }) {
  const bottomRef = useRef(null);

  const { isAuthenticated } = useAuth()
  const { logoutAndNavigate } = useAuthUtils();
  const [eventUidb64, setEventUidb64] = useState("")
  const [showSearchResultContainer, setShowSearchResultContainer] = useState(false)
  const [updateUiOnSearch, setUpdateUiOnSearch] = useState(false)
  const [eventToken, setEventToken] = useState("")
  const [searchHistoryContainer, setSearchHistoryContainer] = useState([])
  const [searchInputData, setSearchInputData] = useState({
    image_url: "",
    search_result_id: "",
    search_mode: "web",
    checkedAIModelValues: "sonar",
  })
  const [searchResponse, setSearchResponse] = useState(null)
  const [searchStarted, setSearchStarted] = useState(false)
  const [dynamicText, setDynamicText] = useState("Please standby, Carrie is working to make your life and work easier...!")
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  useEffect(() => {
    const emailVerificationStatus = searchParams.get("verification_status")
    const event = searchParams.get("event")
    setEventUidb64(searchParams.get("uidb64"))
    setEventToken(searchParams.get("token"))

    if (emailVerificationStatus) {
      if (emailVerificationStatus === "success") {
        toast.success("Email verified successfully 🎉")
      } else if (emailVerificationStatus === "email_already_in_use") {
        toast.error(
          <div>
            <strong style={{ display: "block" }}>Email verification failed!</strong>
            The email address is already linked to a different account.
          </div>)
      } else if (emailVerificationStatus === "invalid") {
        toast.error("Email verification failed. The verification link is invalid.");
      } else if (emailVerificationStatus === "expired") {
        toast.error("Email verification failed. The verification link has expired.");
      }
    } else if (event) {
      if (event === "reset-password") {
        setShowResetPasswordModal(true)
      }
    }

    navigate("/", { replace: true })

  }, [])
  // }, [searchParams, navigate])

  // Refs & state
  const searchBoxRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mobileDropdown2Open, setMobileDropdown2Open] = useState(false);
  const [main2DropdownOpen, setMain2DropdownOpen] = useState(false);
  const [main3DropdownOpen, setMain3DropdownOpen] = useState(false);
  const [mainDropdownOpen, setMainDropdownOpen] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [showFileMetadata, setShowFileMetadata] = useState(false);

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

  function autoGrowSearchBox(el) {
    if (!el) return;
    // We use scrollHeight to allow content to grow; set max-height via css (already present)
    el.style.height = "auto";
    const newH = Math.min(el.scrollHeight, window.innerHeight * 0.4);
    el.style.height = `${newH}px`;
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

  function handleKeyDownOnSearchBox(e) {
    // Enter to submit (Shift+Enter for newline)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearchSubmit();
    }
  }

  function getSearchText() {
    return (searchBoxRef.current?.innerText || "").trim();
  }

  function captureSearchInputData(e) {
    const value = e.currentTarget.innerText;
    console.log(value)
    setSearchInputData(prev => ({
      ...prev,
      prompt: value,
    }));
  }

  function normalizePrompt(text) {
    return text
      .replace(/\u00A0/g, " ")
      .replace(/\n+$/, "")
      .trim();
  }


  async function handleSearchSubmit() {
    const text = normalizePrompt(searchBoxRef.current.innerText);
    if (!text) {
      return;
    }
    if (!isAuthenticated) {
      showCustomToast("Login Required!", { type: "error" })
      return
    }
    const threadId = crypto.randomUUID();
    navigate(`/search/${threadId}`, { state: { ...searchInputData, prompt: text } });

  }

  // File upload handlers
  function onFileUploadClick() {
    fileInputRef.current?.click();
  }

  function onFileInputChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadedFile({
      name: f.name,
      size: f.size,
      type: f.type,
    });
    setShowFileMetadata(true);
  }

  function closeUploadedFileMetadata() {
    setUploadedFile(null);
    setShowFileMetadata(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Simple stub for external redirect
  function redirectURLExternal(url) {
    window.open(url, "_blank", "noopener");
  }

  // AI model change stub
  function changeAIModel(ev, model) {
    ev?.preventDefault();
    console.log("Selected AI model:", model);
    // set state or call backend as needed
    setMain2DropdownOpen(false);
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

  // Bind handlers that were previously attached by calling bindFileUploadHandler/bindSearchHandler
  useEffect(() => {
    // mimic bindFileUploadHandler: attaches click listeners
    const fileUploadBtn = document.getElementById("file-upload-button");
    if (fileUploadBtn) {
      fileUploadBtn.addEventListener("click", onFileUploadClick);
    }
    // cleanup
    return () => {
      if (fileUploadBtn) fileUploadBtn.removeEventListener("click", onFileUploadClick);
    };
  }, []);

  // keep contenteditable autosize in sync when content changes
  useEffect(() => {
    const el = searchBoxRef.current;
    if (!el) return;

    function onInput() {
      autoGrowSearchBox(el); // ONLY layout logic here
    }

    el.addEventListener("input", onInput);
    return () => el.removeEventListener("input", onInput);
  }, []);


  return (

    <>
      <div className="w-full flex flex-col items-center">
        {/* Search results container (empty by default) */}
        {showSearchResultContainer &&
          <div id="search-results-container" className={`${searchStarted ? "!mb-[35rem]" : ""} w-full max-w-4xl`}>
            {searchHistoryContainer.map((item) => (<SearchResult key={item.id} {...{ response: item, prompt: item.prompt }} />))}
            {searchStarted &&
              <p
                className={`search-toast-box mx-auto text-center 
                  ${true ? 'animate-fade-in text-gray-500' : 'text-red-500 mb-8'}
                  p-6 bg-white rounded-lg border border-gray-200`}
                style={{
                  width: "650px",
                }}
              >
                {/* DYNAMIC TEXT GOES HERE... */}
                {dynamicText}
              </p>
            }
            <div ref={bottomRef} />
          </div>
        }

        {/* Search form */}
        <form
          id="search-form"
          // className="z-10 w-full max-w-4xl pb-12 bg-[#fcfcf9] rounded-xl"
          className={`z-10 ${true ? "" : "w-full"} max-w-4xl pb-12 rounded-xl ${updateUiOnSearch ? "fixed -bottom-5" : ""}`}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
        >
          <div className={`relative flex items-center rounded-xl ${updateUiOnSearch ? "!w-full !left-0" : ""}`} id="search-width">
            <div
              id="searchbox_parent_div"
              className="w-full border border-gray-200 rounded-xl p-2 pb-12 bg-white shadow-sm transition-shadow focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-500"
              onClick={() => {
                // focus the editable div when parent clicked
                searchBoxRef.current?.focus();
                placeCaretAtEnd(searchBoxRef.current);
              }}
            >
              <div
                id="ai_search"
                ref={searchBoxRef}
                contentEditable={true}
                data-placeholder="Search, Ask, or Write Anything!"
                name="prompt"
                // onInput={captureSearchInputData}
                onKeyDown={handleKeyDownOnSearchBox}
                // input handled by useEffect attaching 'input'
                className="max-h-[40vh] resize-none w-full rounded-xl pt-2 pl-16 pr-32 md:pl-20 md:pr-40 text-lg bg-white focus:outline-none transition-shadow whitespace-pre-wrap overflow-y-auto"
                style={{ minHeight: "50px" }}
              />
            </div>

            <div className="absolute left-4 flex items-center space-x-1 sm:space-x-2" />

            {/* File metadata box */}
            <div
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
            </div>

            {/* Right controls */}
            <div className="absolute right-4 flex items-center space-x-1 sm:space-x-2">
              {/* AI model dropdown */}
              <div className="relative inline-block">
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
                  className={`${main2DropdownOpen ? "" : "hidden"
                    } absolute right-0 mt-2 w-56 bg-white rounded shadow-lg z-10`}
                >
                  <div className="p-1">
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={(e) => changeAIModel(e, "best")}
                    >
                      Best <i className="fa fa-angle-left text-gray-500 float-right aiFlapperSelected" />
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={(e) => changeAIModel(e, "sonar")}
                    >
                      Sonar
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={(e) => changeAIModel(e, "sonar-pro")}
                    >
                      Sonar Pro
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={(e) => changeAIModel(e, "sonar-reasoning")}
                    >
                      Sonar Reasoning
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={(e) => changeAIModel(e, "sonar-reasoning-pro")}
                    >
                      Sonar Reasoning Pro
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={(e) => changeAIModel(e, "sonar-deep-research")}
                    >
                      Sonar Deep Research
                    </button>
                  </div>
                </div>
              </div>

              {/* Source dropdown */}
              <div className="relative inline-block">
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
                    } absolute right-0 mt-2 bg-white rounded shadow-lg z-10`}
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
              <div className="relative inline-block">
                <button
                  type="button"
                  id="dropdownButton"
                  className="text-gray-500 hover:text-black p-1 sm:p-2"
                  onClick={toggleMain}
                >
                  <i className="fas fa-paperclip text-base sm:text-xl" />
                </button>

                <input id="file-upload" ref={fileInputRef} type="file" className="hidden" onChange={onFileInputChange} />

                <div id="mainDropdown" className={`${mainDropdownOpen ? "" : "hidden"} absolute right-0 mt-2 w-56 bg-white rounded shadow-lg z-10`}>
                  <div className="p-1">
                    <button type="button" id="file-upload-button" className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={onFileUploadClick}>
                      <i className="fa-regular fa-file mr-2" /> Local files
                    </button>

                    <div className="relative">
                      <button type="button" id="submenu2Button" className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setMainDropdownOpen(false) || setMain3DropdownOpen(false)}>
                        <span><i className="fa-solid fa-share-nodes mr-2" /> Connect files</span>
                        <i className="fa fa-angle-right text-gray-500 float-right" />
                      </button>

                      <div id="submenu2" className="hidden absolute top-0 left-full ml-1 bg-white rounded shadow-lg w-[225px]">
                        <button type="button" id="drivePickerBtn" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" style={{ width: "100%", textAlign: "left" }} onClick={() => redirectURLExternal("https://drive.google.com")}>
                          <span><i className="fa-brands fa-google mr-2" /> Google Drive</span>
                          <i className="fa fa-arrow-up text-gray-500 float-right" style={{ transform: "rotate(45deg)" }} />
                        </button>
                        <button type="button" id="dropBoxPickerBtn" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" style={{ width: "100%", textAlign: "left" }} onClick={() => redirectURLExternal("https://www.dropbox.com")}>
                          <span><i className="fa-brands fa-dropbox mr-2" /> Dropbox</span>
                          <i className="fa fa-arrow-up text-gray-500 float-right" style={{ transform: "rotate(45deg)" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mic button */}
              <button type="button" id="mic-button" className="text-gray-500 hover:text-black p-1 sm:p-2" onClick={() => console.log("mic clicked")}>
                <i className="fa-solid fa-microphone-lines text-base sm:text-xl" id="mic-icon" />
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

        {/* AI section (bottom) */}
        {!updateUiOnSearch &&
          < div className="ai-section w-full max-w-4xl mt-6 flex flex-col md:flex-row items-start gap-6" >
            {/* Left */}
            < div className="ai-left flex-1" >
              <h3 className="text-xl font-semibold"><strong>The world’s most wearable AI.</strong></h3>
              <p>Preserve conversations and ask your personalized AI anything.</p>

              <p className="hipaa-text mt-4">
                <i className="fa-solid fa-shield-halved" /> Your data is secured with HIPAA-compliant medical grade privacy protection.
              </p>

              <img src="./assets/images/pete-icons.png" alt="Wearable AI device" className="ai-image mt-4" />
            </div >

            {/* Right */}
            < div className="ai-right w-64" >
              <button
                className="btn-how mb-4 inline-block bg-teal-600 text-white px-4 py-2 rounded"
                onClick={() => redirectURLExternal("https://url.targettext.io/HowItWorks-Limitless")}
              >
                How It Works
              </button>
              <br />
              <img
                src="./assets/images/offerIcon.png"
                alt="Offer"
                className="ai-image cursor-pointer mt-2"
                onClick={() => redirectURLExternal("https://url.targettext.io/LimitLess-Order")}
              />
            </div >
          </div >
        }
      </div >
      {showResetPasswordModal &&
        <ResetPasswordModal {...{ setShowResetPasswordModal, eventUidb64, eventToken }} />
      }
    </>
  );
}
