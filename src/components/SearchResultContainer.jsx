import { forwardRef, useEffect, useRef } from "react";
import SearchResult from "./SearchResult";
import ThinkingLoader from "./ThinkingLoader";
import { useSearch } from "../context/SearchContext";


const SearchResultContainer = forwardRef(({threadId}, ref) => {
  const { searchHistoryContainer, searchStarted, searchInputData } = useSearch()
  
  // console.log(searchHistoryContainer)

  const dynamicText =
    "Thinking... Working Your Request.";


  /* ---------------- SCROLL: NEW SEARCH (EARLY) ---------------- */
  useEffect(() => {
    // Only for NEW search
    if (!searchStarted) return;
    if (searchInputData.search_result_id !== null) return; // edit → no scroll

    const t = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);

    return () => clearTimeout(t);
  }, [searchStarted]);


  // let item = { id: crypto.randomUUID(), response: { content: [{ text: liveAnswer }] }, prompt: prompt }



  /* ==================== RENDER ==================== */
  return (
    <div className="w-full flex flex-col items-center">
      <div id="search-results-container" className={`w-full max-w-4xl`}>
      {/* <div id="search-results-container" className={`${searchStarted ? "!mb-[35rem]" : ""} w-full max-w-4xl`}> */}

        {searchHistoryContainer.map((item) => {
          return (
            <SearchResult
              key={item._key ?? item.id}
              // key={item.id ?? item._key}
              response={item.response}
              prompt={item.prompt}
              pk={item.id}
              threadId={threadId}
            />
          );
        })}

        <div ref={ref} />
      </div>
    </div>
  );
})


export default SearchResultContainer;