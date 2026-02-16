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


const testimonial_data = [
  {
    id: 1,
    name: "Michael Torres",
    role: "AI Product Lead",
    company: "NextWave Systems",
    rating: 5,
    testimonial:
      "The ability to switch between GPT, Grok, and Gemini inside Ask Carrie is a game changer. We test outputs across models instantly without switching platforms. It’s like having multiple AI brains in one workspace."
  },
  {
    id: 2,
    name: "Priya Nair",
    role: "Operations Manager",
    company: "ScaleBridge",
    rating: 5,
    testimonial:
      "Uploading PDFs and spreadsheets directly into Ask Carrie has transformed how we analyze data. It reads, summarizes, and extracts insights from our files in seconds — no manual processing needed."
  },
  {
    id: 3,
    name: "Daniel Brooks",
    role: "Creative Director",
    company: "Visionary Labs",
    rating: 5,
    testimonial:
      "The image understanding and editing features are incredibly powerful. We can analyze visuals, generate new designs, and refine them — all within the same AI interface. It’s streamlined our entire creative workflow."
  },
  {
    id: 4,
    name: "Samantha Lee",
    role: "Business Analyst",
    company: "InsightCore",
    rating: 4,
    testimonial:
      "Generating structured reports in PDF, DOCX, and XLSX directly from AI responses saves us hours every week. Ask Carrie doesn’t just give answers — it produces ready-to-use business documents."
  },
  {
    id: 5,
    name: "Arjun Malhotra",
    role: "Founder",
    company: "DataForge",
    rating: 5,
    testimonial:
      "Ask Carrie stands out because it combines multi-model AI, file uploads, image processing, and document generation in one clean interface. It’s not just a chatbot — it’s a complete AI productivity suite."
  }
];




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
        <div className="flex flex-col items-center w-120 px-8 gap-2 pb-4">
          <span className="text-4xl text-[#652F74] font-semibold">How can I help today?</span>
          <span className="text-sm font-medium text-gray-400">Try out new features: Search, Analyze, and Summarize their own files and online content</span>
        </div>
        {/* SEARCH FORM GOES HERE */}
        <SearchForm
          threadId={threadId}
          setThreadId={setThreadId}
          threadsContainer={threadsContainer}
          setThreadsContainer={setThreadsContainer}
          showSearchSuggestions={true}
        />

        {/* --- GOOGLE VERIFICATION: APP PURPOSE SECTION --- */}
        {!threadId && (
          // {false && (
          <>
            {/* <EncryptedBadge /> */}
            <div className="max-w-6xl bg-stone-100 flex flex-row p-6">
              <AppPurpose />
              <AlertsForm />

            </div>
            <div className="flex flex-col my-12 text-center gap-8">
              <div className="text-gray-400 text-lg font-semibold">TESTIMONIAL</div>
              <div className="text-[#652F74] text-4xl font-semibold">What our Users are saying</div>
              <div className="relative w-full max-w-6xl">

                {/* Scroll Container */}
                <div
                  className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide px-2"
                >
                  {testimonial_data.map((item) => {
                    return (
                      <div
                        key={item.id}
                        className="min-w-80 max-w-80 snap-start border border-gray-300 p-6 rounded-xl bg-stone-100 flex-shrink-0"
                      >
                        {/* Quote Icon */}
                        <div className="text-left mb-3">
                          <i className="fa fa-quote-left font-bold text-3xl text-[#652F74]"></i>
                        </div>

                        {/* Testimonial */}
                        <div className="text-left text-gray-600 mb-4">
                          {item.testimonial}
                        </div>

                        {/* Rating */}
                        {/* <div className="flex mb-3">
                          {[...Array(item.rating)].map((_, i) => (
                            <i key={i} className="fa fa-star text-yellow-400 mr-1"></i>
                          ))}
                        </div> */}

                        {/* User Info */}
                        {/* <div className="text-left">
                          <div className="font-semibold text-[#652F74]">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.role} • {item.company}
                          </div>
                        </div> */}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
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
