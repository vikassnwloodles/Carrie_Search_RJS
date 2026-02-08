import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

// CUSTOM MODULES
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";

// COMPONENTS
import ResetPasswordModal from "../components/ResetPasswordModal";
import SearchForm from "../components/SearchForm";
import AlertsForm from "../components/Home/AlertsForm";
import AppPurpose from "../components/Home/AppPurpose";
import { useSearch } from "../context/SearchContext";
import EncryptedBadge from "../components/Home/EncryptedBadge";



export default function Home() {

  const {
    threadId,
    setThreadId,
    setShowImg,
    threadsContainer,
    setThreadsContainer,
  } = useSearch()

  const { logoutAndNavigate } = useAuthUtils()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // STATES
  const [eventUidb64, setEventUidb64] = useState("")

  const [eventToken, setEventToken] = useState("")
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)


  useEffect(() => {
    const emailVerificationStatus = searchParams.get("verification_status")
    const event = searchParams.get("event")
    setEventUidb64(searchParams.get("uidb64"))
    setEventToken(searchParams.get("token"))

    if (emailVerificationStatus) {
      if (emailVerificationStatus === "success") {
        toast.success("Email verified successfully 🎉")
        localStorage.setItem("authToken", searchParams.get("access"));
        navigate("/");
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
  }, [])



  // Simple stub for external redirect
  function redirectURLExternal(url) {
    window.open(url, "_blank", "noopener");
  }




  /* ---------------- INITIAL LOAD ---------------- */
  // useEffect(() => {
  //   setShowImg(!threadId);

  //   if (threadId && shouldFetchThread) {
  //     fetchThread();
  //   }
  //   return () => { setShowImg(true); setSearchHistoryContainer([]); setShouldFetchThread(true) }
  // }, [threadId]);





  return (

    <>
      <div className="w-full flex flex-col items-center">

        {/* SEARCH FORM GOES HERE */}
        <SearchForm
          threadId={threadId}
          setThreadId={setThreadId}
          threadsContainer={threadsContainer}
          setThreadsContainer={setThreadsContainer}
        />

        {/* --- GOOGLE VERIFICATION: APP PURPOSE SECTION --- */}
        {!threadId && (
          // {false && (
          <>
            <EncryptedBadge />
            <AppPurpose />
            <AlertsForm />
          </>
        )}


        {/* AI section (bottom) */}
        {/* {!threadId && */}
        {false &&
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
