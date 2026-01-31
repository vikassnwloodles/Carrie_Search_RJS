import { useEffect, useState } from 'react'
import { useSearch } from '../context/SearchContext';
import SearchResultContainer from '../components/SearchResultContainer';
import SearchForm from '../components/Home/SearchForm';
import { useLocation, useParams } from 'react-router-dom';

function Thread() {
    // const [threadId, setThreadId] = useState(window.location.pathname.split("/")[2] || null);
    const { threadId } = useParams();
    const location = useLocation();

    const shouldFetchThread = location.state?.shouldFetchThread;

    const { setShowImg, setSearchHistoryContainer } = useSearch()

    const [performScroll, setPerformScroll] = useState(null)

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
            // UPDATE LIBRARY
            setSearchHistoryContainer(resJson);
            setPerformScroll(Math.random())
        }
    }

    useEffect(() => {
        setShowImg(false)
        return () => setShowImg(true)
    }, [])

    useEffect(() => {
        if (shouldFetchThread !== false) fetchThread()
    }, [threadId])

    // useEffect(() => {
    //     if (!performScroll) return
    //     const t = setTimeout(() => {
    //         bottomRef.current?.scrollIntoView({ behavior: "auto" });
    //     }, 0);

    //     return () => clearTimeout(t);
    // }, [performScroll])



    return (

        <>
            <div className="w-full flex flex-col items-center">

                <SearchResultContainer />

                <SearchForm isThreadPage={true} />

            </div >

        </>
    );

}

export default Thread