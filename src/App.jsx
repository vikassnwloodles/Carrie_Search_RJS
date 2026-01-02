import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import AboutUs from "./pages/AboutUs";
import Home from "./pages/Home";
import HowCarrieWorks from "./pages/HowCarrieWorks";
import Pricing from "./pages/Pricing";
import SignupForm from "./pages/Signup";
import LoginPage from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import ForgotPassword from "./pages/ForgotPassword";
import { useState } from "react";
import SearchResultContainer from "./components/SearchResultContainer";
import LibraryPage from "./pages/LibraryPage";
import SearchResult from "./components/SearchResult";

const App = () => {
  const [showImg, setShowImg] = useState(true);
  const [threadId, setThreadId] = useState(window.location.pathname.split("/")[2] || null);
  const [threadsContainer, setThreadsContainer] = useState([]);
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <ToastContainer />
        <div className="flex h-screen">
          <Sidebar
            setThreadId={setThreadId}
            threadsContainer={threadsContainer}
            setThreadsContainer={setThreadsContainer}
          />
          <main id="main-content-area" className="flex-1 flex flex-col">
            <Header />

            <div id="dynamic-content-container" className="flex-1 flex flex-col items-center w-full px-4 overflow-y-auto">
              {/* <div id="center-content-wrapper" className="w-full flex flex-col items-center justify-center flex-1"> */}
              <div id="center-content-wrapper" className="w-full flex flex-col items-center justify-start">

                {/* <div className="w-full flex flex-col items-center justify-start pt-8"> */}
                {showImg && <><img
                  className="Carrie-main-logo"
                  style={{ width: "380px" }}
                  // style={{ width: "380px", marginLeft: "-32px" }}
                  src="/assets/images/pete.png"
                  alt="Carrie"
                />
                  <br />
                  <br />
                </>
                }
                {/* <!-- DYNAMIC CONTENT GOES HERE --> */}
                <Routes>
                  <Route path="/search/:threadId" element={<Home threadId={threadId} setThreadId={setThreadId} setShowImg={setShowImg} threadsContainer={threadsContainer} setThreadsContainer={setThreadsContainer} />} />
                  <Route path="/" element={<Home threadId={threadId} setThreadId={setThreadId} setShowImg={setShowImg} threadsContainer={threadsContainer} setThreadsContainer={setThreadsContainer} />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/how-carrie-works" element={<HowCarrieWorks />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/signup" element={<SignupForm />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/search/public/:chatId" element={<SearchResult setShowImg={setShowImg} />} />
                  <Route path="/library" element={<LibraryPage setShowImg={setShowImg} />} />
                </Routes>
                {/* </div> */}
              </div>
            </div>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App