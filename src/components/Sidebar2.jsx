import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomUserProfileSection from "./BottomUserProfileSection";

export default function Sidebar() {
  const { isAuthenticated } = useAuth();

  const [isLibraryHovered, setIsLibraryHovered] = useState(false);

  return (
    <div className="relative flex">
      {/* MAIN SIDEBAR */}
      <aside
        id="main-sidebar"
        className="w-20 bg-[#f7f7f4] border-r border-gray-200 p-4 flex flex-col items-center justify-between z-20"
      >
        <div>
          <nav className="flex flex-col space-y-6 items-center">
            <Link
              to="/"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-gray-800"
              title="Home"
            >
              <i className="fas fa-home text-xl" />
            </Link>

            {/* LIBRARY (HOVER TRIGGER) */}
            <div
              onMouseEnter={() => setIsLibraryHovered(true)}
              onMouseLeave={() => setIsLibraryHovered(false)}
              className="relative"
            >
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-10 h-10 p-2 rounded-full group-hover:bg-gray-200">
                  📚
                </div>
                <span className="text-xs text-gray-600">Library</span>
              </div>
            </div>
          </nav>
        </div>

        {isAuthenticated && <BottomUserProfileSection />}
      </aside>

      {/* SECONDARY SIDEBAR */}
      <aside
        onMouseEnter={() => setIsLibraryHovered(true)}
        onMouseLeave={() => setIsLibraryHovered(false)}
        className={`
          absolute left-20 top-0 h-full w-64
          bg-white border-r border-gray-200 shadow-lg
          transition-all duration-200 ease-out
          ${isLibraryHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"}
        `}
      >
        <div className="p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase">
            Library
          </h3>

          <Link
            to="/library/history"
            className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
          >
            History
          </Link>

          <Link
            to="/library/favorites"
            className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
          >
            Favorites
          </Link>

          <Link
            to="/library/saved"
            className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
          >
            Saved Items
          </Link>
        </div>
      </aside>
    </div>
  );
}
