// src/components/Header.jsx (or src/Header.jsx — keep your path)
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust path if needed

const Header = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        // navigate to home or login page
        navigate("/");
    }

    return (
        <header id="header" className="p-6 md:p-8 flex items-center justify-between relative">
            <Link to="/about-us" id="about-us-link" className="text-gray-600 hover:text-black font-medium transition-colors">
                About Us
            </Link>

            <button id="mobile-menu-button" className="md:hidden p-2 text-gray-600 hover:text-black z-20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
            </button>

            <nav
                id="mobile-menu"
                className="hidden md:flex flex-col md:flex-row md:items-center absolute md:static top-full left-0 w-full md:w-auto bg-white md:bg-transparent shadow-lg md:shadow-none p-4 md:p-0 z-10 transition-transform duration-300 ease-in-out transform -translate-y-full md:translate-y-0"
            >
                <Link to="/how-carrie-works" className="how-carrie-works-link text-gray-600 hover:text-black font-medium transition-colors block py-2 md:py-0 md:mr-6">
                    How Carrie Works
                </Link>

                <Link to="/pricing" id="pricing-link" className="text-gray-600 hover:text-black font-medium transition-colors block py-2 md:py-0 md:mr-6">
                    Pricing
                </Link>

                {/* Show Signup only when NOT authenticated */}
                {!isAuthenticated && (
                    <Link to="/signup" id="signup-link" className="text-gray-600 hover:text-black font-medium transition-colors block py-2 md:py-0 md:mr-6">
                        Signup
                    </Link>
                )}

                {/* Show Login only when NOT authenticated */}
                {!isAuthenticated && (
                    <Link to="/login" id="login-link" className="text-gray-600 hover:text-black font-medium transition-colors block py-2 md:py-0">
                        Login
                    </Link>
                )}

                {/* Show Logout when authenticated */}
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-black font-medium transition-colors block py-2 md:py-0 bg-transparent border-none md:mr-6"
                    >
                        Logout
                    </button>
                )}

                {/* Show Username when authenticated */}
                {isAuthenticated && user && (
                    <button
                        disabled
                        className="text-gray-600 font-medium transition-colors block py-2 md:py-0 bg-transparent border-none"
                    >
                        {user.username}
                    </button>
                )}
            </nav>
        </header>
    );
};

export default Header;
