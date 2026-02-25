import { forwardRef, useEffect, useRef } from "react";
import SearchResult from "./SearchResult";
import ThinkingLoader from "./ThinkingLoader";
import { useSearch } from "../context/SearchContext";


const SearchResultContainer = forwardRef(({ threadId, setSelectedText, loadMoreSentinelRef, hasMoreThread, loadingThread }, ref) => {
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


  // console.log(searchHistoryContainer)



  /* ==================== RENDER ==================== */
  return (
    <div className="w-full flex flex-col items-center">
      <div id="search-results-container" className={`w-full max-w-4xl`}>
        {/* Sentinel at TOP: when user scrolls up, load older messages (page 2, 3, ...) */}
        {threadId && <div ref={loadMoreSentinelRef} className="h-4 flex-shrink-0" aria-hidden />}
        {threadId && loadingThread && (
          <p className="py-3 text-sm text-gray-500 text-center">Loading older messages...</p>
        )}

        {searchHistoryContainer.map((item) => {
          return (
            <SearchResult
              key={item._key ?? item.id}
              response={item.response}
              prompt={item.prompt}
              pk={item.id}
              threadId={threadId}
              uploadedFiles={item.uploaded_files?.map(file => ({
                ...file,
                type: file.content_type,
                name: file.file_name,
                size: file.file_size,
              }))}
              setSelectedText={setSelectedText}
              selected_text={item.selected_text}
            />
          );
        })}

        <div ref={ref} />
      </div>
    </div>
  );
})


export default SearchResultContainer;