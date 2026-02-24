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
import { useLocation } from "react-router-dom";
import VerifyOtp from "./pages/VerifyOtp";


const App = () => {

  const location = useLocation();

  return (
    <AuthProvider>
      <SearchProvider>
        <ScrollToTop />
        <ToastContainer />
        <div className="flex h-screen">
          <Sidebar />
          <main id="main-content-area" className="flex-1 flex flex-col">
            <Header />

            <div id="dynamic-content-container" className="flex-1 flex flex-col items-center w-full px-4 overflow-y-auto">
              {/* <div id="center-content-wrapper" className="w-full flex flex-col items-center justify-center flex-1"> */}
              <div id="center-content-wrapper" className="w-full flex flex-col items-center justify-start">

                {/* <div className="w-full flex flex-col items-center justify-start pt-8"> */}
                <CarrieLogo />
                {/* <!-- DYNAMIC CONTENT GOES HERE --> */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/thread/:threadId" element={<Thread />} />
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
      </SearchProvider>
    </AuthProvider>
  )
}

export default App