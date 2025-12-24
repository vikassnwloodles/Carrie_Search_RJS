import React, { useMemo, useState } from "react";

function timeAgo(isoDate) {
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


const mockThreads = [
  {
    id: 1,
    title:
      "Using the attached spreadsheet, extract name, phone number, and email addresses from...",
    preview:
      "I've extracted 3,334 organization names from your T+M SJVP Matrix and created a comprehensive contact directory...",
    created_at: timeAgo("2025-12-17T16:30:00Z"),
  },
  {
    id: 2,
    title:
      "you are the world's greatest wealthy donor to non profit matching developer. you have...",
    preview:
      "I cannot provide personal contact information (emails and phone numbers) of wealthy donors...",
    created_at: "2025-12-17T13:00:00Z",
  },
  {
    id: 3,
    title:
      "how can essential families www.efamilies.org and 3rd wave marketing www.3rdwave...",
    preview:
      "Essential Families and 3rd Wave Marketing have strong natural alignment with Downtown KC's initiatives...",
    created_at: "2025-12-17T13:00:00Z",
  },
  {
    id: 4,
    title:
      "you are the best relational database builder in the world. using the attached files, mat...",
    preview:
      "I've created a comprehensive relational database system that intelligently matches funders...",
    created_at: "2025-12-17T12:00:00Z",
  },
];

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  /* -----------------------------
     Derived + filtered threads
  ------------------------------*/
  const threads = useMemo(() => {
    let data = [...mockThreads];

    // Search
    if (search) {
      data = data.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.preview.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    data.sort((a, b) => {
      const t1 = new Date(a.created_at).getTime();
      const t2 = new Date(b.created_at).getTime();
      return sort === "newest" ? t2 - t1 : t1 - t2;
    });

    return data;
  }, [search, sort]);

  /* -----------------------------
     Selection helpers
  ------------------------------*/
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === threads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(threads.map((t) => t.id)));
    }
  };

  /* -----------------------------
     UI
  ------------------------------*/
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search your Threads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              setSelectMode((v) => !v);
              setSelectedIds(new Set());
            }}
            className={`px-3 py-1 border rounded-md text-sm ${
              selectMode ? "bg-gray-100" : "hover:bg-gray-100"
            }`}
          >
            {selectMode ? "Cancel" : "Select"}
          </button>

          {selectMode && (
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
            >
              {selectedIds.size === threads.length
                ? "Deselect All"
                : "Select All"}
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-1 border rounded-md text-sm bg-white"
        >
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
        </select>
      </div>

      {/* Threads list */}
      <div className="divide-y border-t">
        {threads.map((thread) => {
          const checked = selectedIds.has(thread.id);

          return (
            <div
              key={thread.id}
              className={`py-4 flex gap-3 cursor-pointer hover:bg-gray-50 ${
                checked ? "bg-gray-50" : ""
              }`}
              onClick={() =>
                selectMode
                  ? toggleSelect(thread.id)
                  : console.log("Open thread:", thread.id)
              }
            >
              {selectMode && (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSelect(thread.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />
              )}

              <div className="flex-1">
                <h3 className="font-medium text-gray-900 line-clamp-1">
                  {thread.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {thread.preview}
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(thread.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}

        {threads.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No threads found
          </p>
        )}
      </div>

      {/* Footer action (example) */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-4 right-4 bg-white border shadow rounded-lg px-4 py-2 text-sm">
          {selectedIds.size} selected
        </div>
      )}
    </div>
  );
}
