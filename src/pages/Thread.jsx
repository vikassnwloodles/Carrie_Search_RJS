import { useEffect, useState, useRef } from 'react'
import { useSearch } from '../context/SearchContext';
import SearchResultContainer from '../components/SearchResultContainer';
import SearchForm from '../components/SearchForm';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { showCustomToast } from '../utils/customToast';
import { useAuthUtils } from '../utils/useAuthUtils';
import { fetchWithAuth } from '../api/fetchWithAuth';

const THREAD_PAGE_SIZE = 20;

function Thread() {

    const [selectedText, setSelectedText] = useState("")

    const { logoutAndNavigate } = useAuthUtils();
    const { threadId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const bottomRef = useRef(null);
    const loadMoreSentinelRef = useRef(null);
    const skipNextLoadMoreRef = useRef(false);
    const shouldFetchThread = location.state?.shouldFetchThread;

    const { setShowImg, setSearchHistoryContainer } = useSearch()

    const [performScroll, setPerformScroll] = useState(null)
    const [threadPage, setThreadPage] = useState(1);
    const [hasMoreThread, setHasMoreThread] = useState(true);
    const [loadingThread, setLoadingThread] = useState(false);

    /* ---------------- FETCH THREAD (paginated) ---------------- */
    async function fetchThreadPage(page, append) {
        if (loadingThread) return;
        setLoadingThread(true);
        try {
            const url = `${import.meta.env.VITE_API_URL}/threads/${threadId}/?page=${page}&page_size=${THREAD_PAGE_SIZE}`;
            const res = await fetchWithAuth(url, { headers: { "Content-Type": "application/json" } });
            const resJson = await res.json();

            if (!res.ok) {
                setHasMoreThread(false);
                if (res.status === 401) {
                    showCustomToast("Session expired. Please log in again.", { type: "warn" });
                    logoutAndNavigate();
                    return;
                }
                if (res.status === 404 && append) {
                    return;
                }
                showCustomToast(resJson?.detail || resJson?.error || "Failed to load thread", { type: "error" });
                return;
            }

            const data = Array.isArray(resJson) ? resJson : resJson.results ?? resJson.data ?? [];
            const list = [...(Array.isArray(data) ? data : [])].reverse();

            if (append) {
                const scrollRoot = document.querySelector("#dynamic-content-container");
                const oldScrollHeight = scrollRoot?.scrollHeight ?? 0;
                const oldScrollTop = scrollRoot?.scrollTop ?? 0;

                setSearchHistoryContainer((prev) => [...list, ...(Array.isArray(prev) ? prev : [])]);

                setTimeout(() => {
                    requestAnimationFrame(() => {
                        if (scrollRoot) {
                            scrollRoot.scrollTop = oldScrollTop + (scrollRoot.scrollHeight - oldScrollHeight);
                        }
                    });
                }, 0);
            } else {
                setSearchHistoryContainer(list);
            }

            const hasNext = resJson.next != null ? !!resJson.next : list.length >= THREAD_PAGE_SIZE;
            setHasMoreThread(append && list.length === 0 ? false : hasNext);
            setThreadPage(page);
            if (!append) setPerformScroll(Math.random());
        } catch (err) {
            setHasMoreThread(false);
            if (!append) showCustomToast("Failed to load thread", { type: "error" });
        } finally {
            setLoadingThread(false);
        }
    }

    useEffect(() => {
        setShowImg(false);
        return () => {
            setShowImg(true);
            setSearchHistoryContainer([]);
        };
    }, []);

    useEffect(() => {
        if (shouldFetchThread !== false) {
            setThreadPage(1);
            setHasMoreThread(true);
            fetchThreadPage(1, false);
        } else {
            setHasMoreThread(false);
        }
        navigate(location.pathname, { replace: true, state: null });
    }, [threadId]);

    useEffect(() => {
        if (!performScroll) return;
        skipNextLoadMoreRef.current = true;
        const t = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "auto" });
        }, 0);
        return () => clearTimeout(t);
    }, [performScroll]);

    /* ---------------- Infinite scroll: load older messages when user scrolls to TOP (sentinel at top) ---------------- */
    useEffect(() => {
        const sentinel = loadMoreSentinelRef.current;
        const scrollRoot = document.querySelector("#dynamic-content-container");
        if (!sentinel || !scrollRoot) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (!entry?.isIntersecting) return;
                if (skipNextLoadMoreRef.current) {
                    skipNextLoadMoreRef.current = false;
                    return;
                }
                if (hasMoreThread && !loadingThread) {
                    fetchThreadPage(threadPage + 1, true);
                }
            },
            { root: scrollRoot, rootMargin: "100px", threshold: 0 }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [threadId, hasMoreThread, loadingThread, threadPage]);



    return (

        <>
            <div className="w-full flex flex-col items-center">

                <SearchResultContainer
                    ref={bottomRef}
                    threadId={threadId}
                    setSelectedText={setSelectedText}
                    loadMoreSentinelRef={loadMoreSentinelRef}
                    hasMoreThread={hasMoreThread}
                    loadingThread={loadingThread}
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