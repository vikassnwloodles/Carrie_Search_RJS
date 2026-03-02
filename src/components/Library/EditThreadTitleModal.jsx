import { useEffect, useState } from "react";
import { renameThreadAPI } from "../../api/threadsApi";
import { showCustomToast } from "../../utils/customToast";

export default function EditThreadTitleModal({
    currentThread,
    showEditThreadTitleModal,
    setShowEditThreadTitleModal,
    setThreadsContainer
}) {
    const [title, setTitle] = useState("");

    useEffect(() => {
        setTitle(currentThread?.title ?? "")
    }, [currentThread, showEditThreadTitleModal])


    const handleSave = async () => {
        try {
            await renameThreadAPI(currentThread.thread_id, title)
            setShowEditThreadTitleModal(false);
            setThreadsContainer(prev =>
                prev.map(thread =>
                    thread.thread_id === currentThread.thread_id
                        ? { ...thread, last_activity: new Date().toISOString().replace('Z', '') + Math.floor(Math.random() * 1000).toString().padStart(3, '0') + 'Z', title }
                        : thread
                )
            );
        } catch (err) {
            showCustomToast("Something went wrong!", { "type": "error" })
        }
    };

    if (!showEditThreadTitleModal) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
            <div className="bg-stone-50 rounded-2xl shadow-xl w-full max-w-[480px] p-5 sm:p-6 mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 pr-2">Edit Thread Title</h2>
                    <button
                        type="button"
                        onClick={() => setShowEditThreadTitleModal(false)}
                        aria-label="Close"
                        className="cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition touch-manipulation"
                    >
                        <i className="fa-solid fa-xmark text-sm" />
                    </button>
                </div>

                {/* Input */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm outline-none focus:ring-2 focus:ring-gray-300 transition"
                />

                {/* Footer */}
                <div className="flex justify-end mt-5">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="cursor-pointer px-5 py-3 min-h-[44px] bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition touch-manipulation"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}