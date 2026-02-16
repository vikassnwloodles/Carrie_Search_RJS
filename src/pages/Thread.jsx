import { useEffect, useState, useRef } from 'react'
import { useSearch } from '../context/SearchContext';
import SearchResultContainer from '../components/SearchResultContainer';
import SearchForm from '../components/SearchForm';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { showCustomToast } from '../utils/customToast';
import { useAuthUtils } from '../utils/useAuthUtils';
import { fetchWithAuth } from '../utils/fetchWithAuth';

function Thread() {

    // const selectedTextRef = useRef("")
    const [selectedText, setSelectedText] = useState("")

    const { logoutAndNavigate } = useAuthUtils();
    // const [threadId, setThreadId] = useState(window.location.pathname.split("/")[2] || null);
    const { threadId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const bottomRef = useRef(null);
    const shouldFetchThread = location.state?.shouldFetchThread;

    const { setShowImg, setSearchHistoryContainer } = useSearch()

    const [performScroll, setPerformScroll] = useState(null)

    /* ---------------- FETCH THREAD ---------------- */
    async function fetchThread() {
        const res = await fetchWithAuth(
            `${import.meta.env.VITE_API_URL}/threads/${threadId}/`,
            {
                headers: {

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
        return () => {
            setShowImg(true)
            setSearchHistoryContainer([])
        }
    }, [])

    useEffect(() => {
        if (shouldFetchThread !== false) {
            fetchThread()
        }
        // Clear state after using
        navigate(location.pathname, {
            replace: true,
            state: null
        });
    }, [threadId])

    useEffect(() => {
        if (!performScroll) return
        const t = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "auto" });
        }, 0);

        return () => clearTimeout(t);
    }, [performScroll])



    return (

        <>
            <div className="w-full flex flex-col items-center">

                <SearchResultContainer
                    ref={bottomRef}
                    threadId={threadId}
                    setSelectedText={setSelectedText}
                />

                <SearchForm
                    isThreadPage={true}
                    threadId={threadId}
                    selectedText={selectedText}
                    setSelectedText={setSelectedText}
                />

            </div >

        </>
    );

}

export default Thread