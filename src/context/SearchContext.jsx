import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export function SearchProvider({ children }) {

    // History
    const [searchHistoryContainer, setSearchHistoryContainer] = useState([]);

    // Current input
    const [searchInputData, setSearchInputData] = useState({
        image_url: "",
        search_mode: "web",
        checkedAIModelValues: localStorage.getItem("model") || "best",
    });

    // Example future states
    const [searchResults, setSearchResults] = useState(null);
    const [searchStarted, setSearchStarted] = useState(false);
    const [showImg, setShowImg] = useState(true);
    const [threadsContainer, setThreadsContainer] = useState([]);

    return (
        <SearchContext.Provider value={{
            searchHistoryContainer,
            setSearchHistoryContainer,
            searchInputData,
            setSearchInputData,
            searchResults,
            setSearchResults,
            searchStarted,
            setSearchStarted,
            showImg,
            setShowImg,
            threadsContainer,
            setThreadsContainer
        }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    return useContext(SearchContext);
}
