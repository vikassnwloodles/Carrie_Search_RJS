import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

/* -----------------------------
   Time ago helper
------------------------------*/
function timeAgo(isoDate) {
    if (!isoDate) return "";

    const now = new Date();
    const past = new Date(isoDate);
    const diffInSeconds = Math.floor((now - past) / 1000);

    const units = [
        { name: "year", seconds: 31536000 },
        { name: "month", seconds: 2592000 },
        { name: "day", seconds: 86400 },
        { name: "hour", seconds: 3600 },
        { name: "minute", seconds: 60 },
        { name: "second", seconds: 1 },
    ];

    for (const unit of units) {
        const value = Math.floor(diffInSeconds / unit.seconds);
        if (value >= 1) {
            const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
            return rtf.format(-value, unit.name);
        }
    }

    return "just now";
}

function ThreadsList({ threads, styles = "divide-y border-t" }) {
    const navigate = useNavigate();

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [selectMode, setSelectMode] = useState(false);

    if (!threads?.length) return null;


    return (
        <div className={`${styles}`}>
            {
                threads?.map((thread) => {
                    const id = thread.id;
                    const checked = selectedIds.has(id);

                    return (
                        <div
                            key={id}
                            className={`py-4 flex gap-3 cursor-pointer hover:bg-gray-50 ${checked ? "bg-gray-50" : ""
                                }`}
                            onClick={() =>
                                selectMode
                                    ? toggleSelect(id)
                                    : navigate(`/thread/${thread.thread_id}`)
                            }
                        >
                            {selectMode && (
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSelect(id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-1"
                                />
                            )}

                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 line-clamp-1">
                                    {thread.title ?? "Untitled thread"}
                                </h3>

                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                    {thread.first_message ?? ""}
                                </p>

                                <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <span>🕒</span>
                                    <span>{timeAgo(thread.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })
            }
        </div>
    )
}

export default ThreadsList