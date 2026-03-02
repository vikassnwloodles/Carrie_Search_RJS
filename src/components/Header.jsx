// src/components/Header.jsx (or src/Header.jsx — keep your path)
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust path if needed

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
    );
    useEffect(() => {
        const mql = window.matchMedia("(max-width: 767px)");
        const handler = () => setIsMobile(mql.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);
    return isMobile;
}

const Header = ({ onSidebarToggle = () => {} }) => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [backdropReady, setBackdropReady] = useState(false);
    const isMobile = useIsMobile();

    // Delay backdrop close-handler so the opening tap doesn’t immediately close the menu
    useEffect(() => {
        if (!isMobile || !mobileNavOpen) {
            setBackdropReady(false);
            return;
        }
        const t = setTimeout(() => setBackdropReady(true), 200);
        return () => clearTimeout(t);
    }, [isMobile, mobileNavOpen]);

    function handleLogout() {
        logout();
        navigate("/");
        setMobileNavOpen(false);
    }

    return (
        <header id="header" className="relative z-30 p-4 sm:p-6 md:p-8 flex items-center justify-between gap-2">
            {/* Sidebar hamburger - mobile only */}
            <button
                type="button"
                id="sidebar-menu-button"
                aria-label="Open menu"
                onClick={onSidebarToggle}
                className="md:hidden p-2 -ml-1 text-gray-600 hover:text-black z-20 rounded-lg hover:bg-gray-100"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <Link to="/about-us" id="about-us-link" className="text-gray-600 hover:text-black font-medium transition-colors">
                About Us
            </Link>

            {/* Three-dot / Cross toggle: opens menu below on mobile */}
            <div className="relative ml-auto md:ml-0">
                {/* Backdrop: close menu on tap outside (mobile only), active after short delay so open-tap doesn’t close */}
                {isMobile && mobileNavOpen && (
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => backdropReady && setMobileNavOpen(false)}
                        onTouchEnd={(e) => {
                            if (!backdropReady) return;
                            e.preventDefault();
                            setMobileNavOpen(false);
                        }}
                        className="fixed inset-0 z-40 md:hidden"
                        style={{ background: "transparent", pointerEvents: backdropReady ? "auto" : "none" }}
                    />
                )}
                <button
                    type="button"
                    id="mobile-menu-button"
                    aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileNavOpen}
                    onPointerDown={(e) => {
                        e.preventDefault();
                        setMobileNavOpen((v) => !v);
                    }}
                    className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-black z-50 rounded-lg hover:bg-gray-100 touch-manipulation relative"
                >
                    {mobileNavOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <circle cx="12" cy="6" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="18" r="1.5" />
                        </svg>
                    )}
                </button>
                {/* Mobile dropdown: just below the button (z-50 so above backdrop) */}
                {isMobile && mobileNavOpen && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu"
                        className="absolute right-0 top-full mt-1 min-w-[200px] py-2 px-3 bg-white rounded-xl border border-gray-200 shadow-lg z-50 text-left"
                    >
                        <Link to="/how-carrie-works" onClick={() => setMobileNavOpen(false)} className="how-carrie-works-link text-gray-600 hover:text-black font-medium py-2.5 block">
                            How Carrie Works
                        </Link>
                        <Link to="/pricing" onClick={() => setMobileNavOpen(false)} className="text-gray-600 hover:text-black font-medium py-2.5 block">
                            Pricing
                        </Link>
                        {!isAuthenticated && (
                            <Link to="/signup" onClick={() => setMobileNavOpen(false)} className="text-gray-600 hover:text-black font-medium py-2.5 block">
                                Signup
                            </Link>
                        )}
                        {!isAuthenticated && (
                            <Link to="/login" onClick={() => setMobileNavOpen(false)} className="text-gray-600 hover:text-black font-medium py-2.5 block">
                                Login
                            </Link>
                        )}
                        {isAuthenticated && (
                            <button
                                type="button"
                                onClick={() => { handleLogout(); setMobileNavOpen(false); }}
                                className="text-gray-600 hover:text-black font-medium py-2.5 block w-full text-left bg-transparent border-none"
                            >
                                Logout
                            </button>
                        )}
                        {isAuthenticated && user && (
                            <span className="text-gray-500 font-medium py-2.5 block text-sm border-t border-gray-100 mt-1 pt-2">
                                {user.username}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop: inline nav; Mobile: dropdown from three-dot/cross button above */}
            <nav
                id="mobile-menu"
                className={`hidden md:flex flex-col md:flex-row md:items-center md:static md:right-auto w-full md:w-auto bg-white md:bg-transparent shadow-lg md:shadow-none z-40 transition-all duration-200 ease-out text-left md:py-0 md:px-0`}
            >
                <Link to="/how-carrie-works" className="how-carrie-works-link text-gray-600 hover:text-black font-medium transition-colors block py-2.5 md:py-0 md:mr-6 w-full md:w-auto text-left">
                    How Carrie Works
                </Link>
                <Link to="/pricing" id="pricing-link" className="text-gray-600 hover:text-black font-medium transition-colors block py-2.5 md:py-0 md:mr-6 w-full md:w-auto text-left">
                    Pricing
                </Link>
                {!isAuthenticated && (
                    <Link to="/signup" id="signup-link" className="text-gray-600 hover:text-black font-medium transition-colors block py-2.5 md:py-0 md:mr-6 w-full md:w-auto text-left">
                        Signup
                    </Link>
                )}
                {!isAuthenticated && (
                    <Link to="/login" id="login-link" className="text-gray-600 hover:text-black font-medium transition-colors block py-2.5 md:py-0 w-full md:w-auto text-left">
                        Login
                    </Link>
                )}
                {isAuthenticated && (
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-black cursor-pointer font-medium transition-colors block py-2.5 md:py-0 md:mr-6 w-full md:w-auto text-left bg-transparent border-none"
                    >
                        Logout
                    </button>
                )}
                {isAuthenticated && user && (
                    <span className="text-gray-500 font-medium block py-2.5 md:py-0 md:mr-6 w-full md:w-auto text-left text-sm md:border-0 md:mt-0 md:pt-0">
                        {user.username}
                    </span>
                )}
            </nav>
        </header>
    );
};

export default Header;
