// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ResetPasswordModal from "../components/ResetPasswordModal";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";
import { useAuth } from "../context/AuthContext";
import SearchResult from "../components/SearchResultContainer";
import SearchForm from "../components/SearchForm";

export default function Home({ setShowImg }) {
  const bottomRef = useRef(null);

  const { logoutAndNavigate } = useAuthUtils();
  const [eventUidb64, setEventUidb64] = useState("")
  const [showSearchResultContainer, setShowSearchResultContainer] = useState(false)
  const [updateUiOnSearch, setUpdateUiOnSearch] = useState(false)
  const [eventToken, setEventToken] = useState("")
  const [searchHistoryContainer, setSearchHistoryContainer] = useState([])

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

        {/* SEARCH FORM GOES HERE */}
        <SearchForm
          updateUiOnSearch={updateUiOnSearch}
          searchStarted={searchStarted}
        />

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
