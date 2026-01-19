import { forwardRef, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SearchResult from "./SearchResult";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";

const SearchResultContainer = forwardRef(({ searchStarted, pk, searchHistoryContainer, fireSearch, threadId }, ref) => {

  const showFileMetadata = false
  const uploadedFile = {}
  const main2DropdownOpen = false
  const main3DropdownOpen = false
  const mainDropdownOpen = false
  const response = false

  const navigate = useNavigate();
  const location = useLocation();
  const { logoutAndNavigate } = useAuthUtils();

  const searchInputData = location.state || { checkedAIModelValues: localStorage.getItem("model") || "best" };
  const searchBoxRef = useRef(null);



  // const dynamicText =
  //   "Please standby, Carrie is working on your request...";
  const dynamicText =
    "Thinking... Working Your Request.";

  /* ---------------- SCROLL CONTROL REFS ---------------- */
  const hasScrolledOnInitialLoadRef = useRef(false);


  /* ---------------- SCROLL: INITIAL PAGE LOAD ---------------- */
  // useEffect(() => {
  //   if (!threadId) return;
  //   if (!searchHistoryContainer.length) return;
  //   if (hasScrolledOnInitialLoadRef.current) return;

  //   hasScrolledOnInitialLoadRef.current = true;

  //   const t = setTimeout(() => {
  //     ref.current?.scrollIntoView({ behavior: "auto" });
  //   }, 0);

  //   return () => clearTimeout(t);
  // }, [searchHistoryContainer, threadId]);

  /* ---------------- SCROLL: NEW SEARCH (EARLY) ---------------- */
  useEffect(() => {
    // Only for NEW search
    if (!searchStarted) return;
    if (pk !== null) return; // edit → no scroll

    const t = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);

    return () => clearTimeout(t);
  }, [searchStarted]);

  /* ---------------- INPUT HANDLER ---------------- */
  function handleKeyDownOnSearchBox(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fireSearch(searchBoxRef.current.innerText);
    }
  }

  /* ==================== RENDER ==================== */
  return (
    <div className="w-full flex flex-col items-center">
      <div id="search-results-container" className={`${searchStarted ? "!mb-[35rem]" : ""} w-full max-w-4xl`}>
        {/* EXISTING RESULTS */}
        {searchHistoryContainer.map((item) => {
          // ✏️ replace ONLY edited card
          if (searchStarted && pk === item.id) {
            return (
              <p
                key={`toast-${item.id}`}
                className="search-toast-box mx-auto text-center
                           animate-fade-in text-gray-500
                           p-6 bg-white rounded-lg border border-gray-200 mb-12"
                style={{ width: "650px" }}
              >
                {dynamicText}
              </p>
            );
          }

          return (
            <SearchResult
              key={item.id}
              response={item.response}
              prompt={item.prompt}
              pk={item.id}
              onSearch={fireSearch}
              threadId={threadId}
            />
          );
        })}

        {/* 🆕 NEW SEARCH TOAST (BOTTOM) */}
        {searchStarted && pk === null && (
          <p
            className="search-toast-box mx-auto text-center
                       animate-fade-in text-gray-500
                       p-6 bg-white rounded-lg border border-gray-200 mt-6"
            style={{ width: "650px" }}
          >
            {dynamicText}
          </p>
        )}

        <div ref={ref} />
      </div>
    </div>
  );
})


export default SearchResultContainer;