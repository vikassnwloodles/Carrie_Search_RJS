import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Routes, Route } from "react-router-dom";
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
import LibraryPage from "./pages/LibraryPage";
import SearchResult from "./components/SearchResult";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { SearchProvider } from "./context/SearchContext";
import Thread from "./pages/Thread";
import CarrieLogo from "./components/CarrieLogo";
import Space from "./pages/Space";
import SpacesListPage from "./pages/SpacesListPage";
import { useLocation } from "react-router-dom";
import VerifyOtp from "./pages/VerifyOtp";

const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = () => setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

const App = () => {
  const location = useLocation();
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const showMobileOverlay = isMobile && sidebarMobileOpen;

  return (
    <AuthProvider>
      <SearchProvider>
        <ScrollToTop />
        <ToastContainer />
        <div className="flex h-screen min-w-0 overflow-x-hidden">
          {/* Sidebar: when mobile overlay open it's portaled to body; otherwise here (hidden on mobile when closed, visible on md+) */}
          {!showMobileOverlay && (
            <div
              className={`fixed md:relative inset-y-0 left-0 w-[320px] md:w-auto flex-shrink-0 h-full min-h-0 md:min-h-full transition-transform duration-300 ease-out ${sidebarMobileOpen ? "translate-x-0 z-[60]" : "-translate-x-full md:translate-x-0 z-50 md:z-auto"}`}
            >
              <Sidebar onClose={() => setSidebarMobileOpen(false)} />
            </div>
          )}
          <main id="main-content-area" className="flex-1 flex flex-col min-w-0 relative z-[60] md:z-auto">
            <Header onSidebarToggle={() => setSidebarMobileOpen((v) => !v)} />

            <div id="dynamic-content-container" className="flex-1 flex flex-col items-center w-full min-w-0 px-4 overflow-y-auto overflow-x-hidden">
              {/* <div id="center-content-wrapper" className="w-full flex flex-col items-center justify-center flex-1"> */}
              <div id="center-content-wrapper" className="w-full flex flex-col items-center justify-start min-w-0 max-w-full">

                {/* <div className="w-full flex flex-col items-center justify-start pt-8"> */}
                <CarrieLogo />
                {/* <!-- DYNAMIC CONTENT GOES HERE --> */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/thread/:threadId" element={<Thread />} />
                  <Route path="/spaces" element={<SpacesListPage />} />
                  <Route path="/space/:spaceId" element={<Space key={location.pathname} />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/how-carrie-works" element={<HowCarrieWorks />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/signup" element={<SignupForm />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/verify-otp" element={<VerifyOtp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/search/public/:chatId" element={<SearchResult />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                </Routes>
                {/* </div> */}
            </div>
          </div>
        </main>
        </div>
        {/* Mobile: portal overlay + sidebar to body so overlay reliably receives tap outside */}
        {showMobileOverlay && createPortal(
          <>
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setSidebarMobileOpen(false)}
              onTouchEnd={(e) => {
                e.preventDefault();
                setSidebarMobileOpen(false);
              }}
              style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer" }}
            />
            <div
              style={{ position: "fixed", inset: "0 auto 0 0", zIndex: 9999, width: 320, maxWidth: "100%", transition: "transform 0.3s ease-out", pointerEvents: "none" }}
              className="h-full min-h-0 flex-shrink-0 bg-transparent"
            >
              <Sidebar onClose={() => setSidebarMobileOpen(false)} />
            </div>
          </>,
          document.body
        )}
      </SearchProvider>
    </AuthProvider>
  )
}

export default App