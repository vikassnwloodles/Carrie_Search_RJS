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
        search_result_id: null,
        sourceWeb: true,
        sourceAcademic: false,
        sourceFinance: false,
    });

    // Example future states
    const [searchResults, setSearchResults] = useState(null);
    const [searchStarted, setSearchStarted] = useState(false);
    const [streamStarted, setStreamStarted] = useState(false)
    const [showImg, setShowImg] = useState(true);
    const [threadsContainer, setThreadsContainer] = useState([]);
    const [spacesContainer, setSpacesContainer] = useState([]);
    const [imageGenerationStarted, setImageGenerationStarted] = useState(false)
    const [fileGenerationStarted, setFileGenerationStarted] = useState(false)
    const [fetchedSpaces, setFetchedSpaces] = useState(false);
    const [deletedSpaceId, setDeletedSpaceId] = useState(null);
    const [updatedSpace, setUpdatedSpace] = useState(null);
    const [newThreadForSidebar, setNewThreadForSidebar] = useState(null);
    const [deletedThreadId, setDeletedThreadId] = useState(null);
    const [newSpaceForSidebar, setNewSpaceForSidebar] = useState(null);

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
            streamStarted,
            setStreamStarted,
            showImg,
            setShowImg,
            threadsContainer,
            setThreadsContainer,
            imageGenerationStarted,
            setImageGenerationStarted,
            fileGenerationStarted,
            setFileGenerationStarted,
            spacesContainer,
            setSpacesContainer,
            fetchedSpaces,
            setFetchedSpaces,
            deletedSpaceId,
            setDeletedSpaceId,
            updatedSpace,
            setUpdatedSpace,
            newThreadForSidebar,
            setNewThreadForSidebar,
            deletedThreadId,
            setDeletedThreadId,
            newSpaceForSidebar,
            setNewSpaceForSidebar,
        }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    return useContext(SearchContext);
}
