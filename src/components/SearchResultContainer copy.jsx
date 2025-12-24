import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SearchResult from "./SearchResult";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";

export default function SearchResultContainer({ setShowImg }) {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutAndNavigate } = useAuthUtils();

  const searchInputData = location.state || {};
  const searchBoxRef = useRef(null);
  const bottomRef = useRef(null);

  const [searchHistoryContainer, setSearchHistoryContainer] = useState([]);
  const [searchStarted, setSearchStarted] = useState(false);
  const [pk, setPk] = useState(null);

  const dynamicText =
    "Please standby, Carrie is working on your request...";

  /* ---------------- SCROLL CONTROL REFS ---------------- */
  const hasScrolledOnInitialLoadRef = useRef(false);

  /* ---------------- FETCH THREAD ---------------- */
  async function fetchThread() {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/threads/${threadId}/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    const resJson = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        showCustomToast("Session expired. Please log in again.", {
          type: "warn",
        });
        logoutAndNavigate();
      } else {
        showCustomToast(resJson, { type: "error" });
      }
    } else {
      setSearchHistoryContainer(resJson);
    }
  }

  /* ---------------- FIRE SEARCH ---------------- */
  async function fireSearch(prompt, id = null) {
    setPk(id);              // null → new search, id → edit
    setSearchStarted(true); // toast visible immediately

    if (prompt) searchInputData.prompt = prompt;
    if (searchBoxRef.current) searchBoxRef.current.innerText = "";

    const res = await fetch(`${import.meta.env.VITE_API_URL}/search/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({
        ...searchInputData,
        thread_id: threadId,
        search_result_id: id,
      }),
    });

    const resJson = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        showCustomToast("Session expired. Please log in again.", {
          type: "warn",
        });
        logoutAndNavigate();
      } else {
        showCustomToast(resJson, { type: "error" });
      }
    } else {
      if (!id) {
        // 🆕 new search
        setSearchHistoryContainer((prev) => [
          ...prev,
          {
            id: resJson.id,
            response: resJson,
            prompt: searchInputData.prompt,
          },
        ]);
      } else {
        // ✏️ edited search
        setSearchHistoryContainer((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, response: resJson, prompt: searchInputData.prompt }
              : item
          )
        );
      }
    }

    setSearchStarted(false);
    setPk(null);
  }

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    setShowImg(false);

    if (location.state) {
      navigate(location.pathname, { replace: true });
      fireSearch();
    } else if (threadId) {
      fetchThread();
    }

    return () => setShowImg(true);
  }, [threadId]);

  /* ---------------- SCROLL: INITIAL PAGE LOAD ---------------- */
  useEffect(() => {
    if (!threadId) return;
    if (!searchHistoryContainer.length) return;
    if (hasScrolledOnInitialLoadRef.current) return;

    hasScrolledOnInitialLoadRef.current = true;

    const t = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, 0);

    return () => clearTimeout(t);
  }, [searchHistoryContainer, threadId]);

  /* ---------------- SCROLL: NEW SEARCH (EARLY) ---------------- */
  useEffect(() => {
    // Only for NEW search
    if (!searchStarted) return;
    if (pk !== null) return; // edit → no scroll

    const t = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

        <div ref={bottomRef} />
      </div>

      {/* SEARCH INPUT */}
      <form
        className="z-10 w-full max-w-4xl pb-12 rounded-xl fixed -bottom-5"
        onSubmit={(e) => {
          e.preventDefault();
          fireSearch(searchBoxRef.current.innerText);
        }}
      >
        <div className="relative flex items-center rounded-xl w-full">
          <div className="w-full border border-gray-200 rounded-xl p-2 pb-12 bg-white shadow-sm focus-within:ring-2 focus-within:ring-teal-500">
            <div
              ref={searchBoxRef}
              contentEditable
              data-placeholder="Search, Ask, or Write Anything!"
              onKeyDown={handleKeyDownOnSearchBox}
              className="max-h-[40vh] w-full rounded-xl pt-2 pl-16 pr-32 text-lg bg-white focus:outline-none whitespace-pre-wrap overflow-y-auto"
              style={{ minHeight: "50px" }}
            />
          </div>

          <div className="absolute right-4">
            <button
              type="submit"
              className="bg-teal-600 text-white rounded-lg w-12 h-12 flex items-center justify-center hover:bg-teal-700"
            >
              <i
                className={`fas ${
                  searchStarted ? "fa-stop" : "fa-arrow-right"
                }`}
              />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
