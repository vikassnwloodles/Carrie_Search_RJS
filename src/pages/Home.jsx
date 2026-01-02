import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ResetPasswordModal from "../components/ResetPasswordModal";
import SearchForm from "../components/SearchForm";
import SearchResultContainer from "../components/SearchResultContainer";
import { showCustomToast } from "../utils/customToast";
import { ApiError } from "../errors/ApiError";
import { useAuthUtils } from "../utils/useAuthUtils";


export default function Home({ threadId, setThreadId, setShowImg, threadsContainer, setThreadsContainer }) {

  const { logoutAndNavigate } = useAuthUtils()

  const searchBoxRef = useRef(null);
  const bottomRef = useRef(null);

  const [performScroll, setPerformScroll] = useState(null)
  const [eventUidb64, setEventUidb64] = useState("")
  const [shouldFetchThread, setShouldFetchThread] = useState(true)
  const [eventToken, setEventToken] = useState("")
  const [searchHistoryContainer, setSearchHistoryContainer] = useState([]);
  const [pk, setPk] = useState(null);
  const [searchInputData, setSearchInputData] = useState({
    image_url: "",
    search_result_id: "",
    search_mode: "web",
    checkedAIModelValues: localStorage.getItem("model") || "best",
  })

  const [searchStarted, setSearchStarted] = useState(false)
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

    // navigate("/", { replace: true })

  }, [])
  // }, [searchParams, navigate])



  const [mobileDropdown2Open, setMobileDropdown2Open] = useState(false);


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



  // Simple stub for external redirect
  function redirectURLExternal(url) {
    window.open(url, "_blank", "noopener");
  }


  /* ---------------- FIRE SEARCH ---------------- */
  async function fireSearch(prompt, id = null, threadId = null, imageUrl = null, docContent = null) {
    let resJson;
    try {
      if (prompt || searchInputData.prompt) {
        if (prompt) {
          searchInputData.prompt = prompt.trim()
        } else {
          searchInputData.prompt = searchInputData.prompt.trim()
        }
      } else {
        return
      }

      if (docContent) {
        searchInputData.prompt = searchInputData.prompt + "\n\n================== [Start of Attached Doc] ==================\n" + docContent + "\n================== [End of Attached Doc] =================="
      }

      setPk(id);              // null → new search, id → edit
      setSearchStarted(true); // toast visible immediately

      if (searchBoxRef.current) searchBoxRef.current.innerText = "";

      // PREPARE PAYLOAD
      const payload = JSON.stringify({
        ...searchInputData,
        thread_id: threadId,
        search_result_id: id,
        image_url: imageUrl
      })

      const res = await fetch(`${import.meta.env.VITE_API_URL}/search/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: payload,
      });

      resJson = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", {
            type: "warn",
          });
          logoutAndNavigate();
        } else if (res.status === 402) {
          showCustomToast(resJson, { type: "error" });
          navigate("/pricing")
        } else {
          showCustomToast(resJson, { type: "error" });
        }
      } else {
        if (!id) {
          // 🆕 new search
          setSearchHistoryContainer((prev) => [
            ...prev,
            {
              id: resJson.pk,
              response: resJson,
              prompt: searchInputData.prompt,
            },
          ]);
        } else {
          // ✏️ edited search
          setSearchHistoryContainer((prev) =>
            prev.map((item) =>
              item.id === id
                ? { ...item, response: resJson, prompt: searchInputData.prompt }
                : item
            )
          );
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        showCustomToast(err.message, { type: err.type, title: err.title })
      } else {
        console.error(err);
        showCustomToast({ message: "Something went wrong" }, { type: "error" });
      }
    } finally {
      setSearchStarted(false);
      setPk(null);
    }
    return resJson
  }

  /* ---------------- FETCH THREAD ---------------- */
  async function fetchThread() {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/threads/${threadId}/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    const resJson = await res.json();

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
      // UPDATE LIBRARY

      setSearchHistoryContainer(resJson);
      setPerformScroll(Math.random())
    }
  }

  // /* ---------------- INITIAL LOAD ---------------- */
  // useEffect(() => {
  //   setShowImg(!threadId);

  //   if (location.state) {
  //     navigate(location.pathname, { replace: true });
  //     fireSearch();
  //   } else if (threadId) {
  //     fetchThread();
  //   }

  //   return () => {setShowImg(true);}
  //   // return () => {setShowImg(true); setSearchHistoryContainer([])}
  // }, [threadId]);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    setShowImg(!threadId);

    if (threadId && shouldFetchThread) {
      fetchThread();
    }

    // return () => { setShowImg(true); }
    return () => {setShowImg(true); setSearchHistoryContainer([]); setShouldFetchThread(true)}
  }, [threadId]);


  useEffect(() => {
    if (!performScroll) return
    const t = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, 0);

    return () => clearTimeout(t);
  }, [performScroll])


  return (

    <>
      <div className="w-full flex flex-col items-center">
        {/* Search results container (empty by default) */}
        {threadId &&
          <SearchResultContainer
            ref={bottomRef}
            searchStarted={searchStarted}
            pk={pk}
            searchHistoryContainer={searchHistoryContainer}
            fireSearch={fireSearch}
            threadId={threadId}
          />
        }

        {/* SEARCH FORM GOES HERE */}
        <SearchForm
          ref={searchBoxRef}
          searchStarted={searchStarted}
          threadId={threadId}
          setThreadId={setThreadId}
          fireSearch={fireSearch}
          searchInputData={searchInputData}
          setSearchInputData={setSearchInputData}
          threadsContainer={threadsContainer}
          setThreadsContainer={setThreadsContainer}
          setShouldFetchThread={setShouldFetchThread}
        />

        {/* AI section (bottom) */}
        {!threadId &&
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
