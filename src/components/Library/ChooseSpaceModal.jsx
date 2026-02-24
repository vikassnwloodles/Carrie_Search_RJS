import { useEffect, useState } from "react";
import { useSearch } from "../../context/SearchContext";
import { useSpaces } from "../../hooks/useSpaces";
import { useNavigate } from "react-router-dom";
import { useAddThreadToSpace } from "../../hooks/useAddThreadToSpace";



export default function ChooseSpaceModal({ currentThread, currentSpace, setThreadsContainer, showChooseSpaceModal, setShowChooseSpaceModal }) {
    const { addThreadToSpace } = useAddThreadToSpace();
    const navigate = useNavigate();
    const { fetchSpaces } = useSpaces();
    const { spacesContainer } = useSearch();


    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (showChooseSpaceModal) {
            fetchSpaces()
        }
    }, [showChooseSpaceModal])

    if (!showChooseSpaceModal) {
        return null
    }




    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            {/* <div className="bg-white rounded-2xl shadow-xl w-[420px] max-w-[95vw] p-7"> */}
            <div className="bg-white rounded-2xl shadow-xl w-[420px] max-w-[95vw] max-h-[80vh] flex flex-col p-7">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                        Choose Space
                    </h2>
                    <button
                        onClick={() => setShowChooseSpaceModal(false)}
                        aria-label="Close"
                        className="cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md p-1 transition"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M12 4L4 12M4 4l8 8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* List */}
                {/* <div className="flex flex-col gap-1"> */}
                {/* <div className="flex flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin"> */}
                <div className="flex flex-col gap-1 overflow-y-auto scrollbar-auto pr-1">
                    {/* New Space button */}
                    <button
                        onClick={() => navigate(`/space/${crypto.randomUUID()}`, {
                            state: {
                                thread: currentThread,
                            }
                        })}
                        className="cursor-pointer flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-left w-full"
                    >
                        <span className="text-gray-500 text-lg leading-none font-light">+</span>
                        <span className="text-sm text-gray-700 font-medium">New Space</span>
                    </button>

                    {/* Divider */}
                    <div className="my-1.5 h-px bg-gray-100" />

                    {/* Space items */}
                    {spacesContainer.map((space, i) => {
                        const is_current_space = (space?.space_id && currentSpace?.space_id)
                            ? space.space_id === currentSpace.space_id
                            : false;
                        return (
                            <button
                                disabled={is_current_space}
                                key={i}
                                onClick={() => {
                                    setSelected(i); addThreadToSpace(currentThread.thread_id, space.space_id, () => {
                                        setShowChooseSpaceModal(false); setThreadsContainer(prev =>
                                            prev.map(thread =>
                                                thread.thread_id === currentThread.thread_id
                                                    ? { ...thread, last_activity: new Date().toISOString().replace('Z', '') + Math.floor(Math.random() * 1000).toString().padStart(3, '0') + 'Z', space }
                                                    : thread
                                            )
                                        );
                                    })
                                }}
                                className={`
                                ${is_current_space && "bg-gray-200 cursor-not-allowed"} 
                                flex items-center px-3.5 py-2.5 rounded-xl text-sm text-left w-full transition
                                ${!is_current_space && "hover:bg-indigo-50 hover:text-indigo-700 hover:font-medium cursor-pointer"}
                                `}
                            >
                                <span className="truncate w-full">
                                    {space.space_name}
                                </span>
                                {is_current_space && <i className="far fa-circle-check text-indigo-700 ml-2"></i>}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}