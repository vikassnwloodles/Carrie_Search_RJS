import { useEffect, useRef } from "react";
import SearchResult from "./SearchResult";
import ThinkingLoader from "./ThinkingLoader";
import { useSearch } from "../context/SearchContext";


const SearchResultContainer = () => {
  const { searchHistoryContainer, searchStarted } = useSearch()
  const bottomRef = useRef(null);

  const dynamicText =
    "Thinking... Working Your Request.";


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


  // let item = { id: crypto.randomUUID(), response: { content: [{ text: liveAnswer }] }, prompt: prompt }



  /* ==================== RENDER ==================== */
  return (
    <div className="w-full flex flex-col items-center">
      <div id="search-results-container" className={`${searchStarted ? "!mb-[35rem]" : ""} w-full max-w-4xl`}>

        {searchHistoryContainer.map((item) => {
          return (
            <SearchResult
              key={item.id}
              response={item.response}
              prompt={item.prompt}
              pk={item.id}
            />
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}


export default SearchResultContainer;