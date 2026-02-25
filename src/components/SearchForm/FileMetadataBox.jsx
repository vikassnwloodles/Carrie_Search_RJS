import React, { useState, useEffect } from 'react'

function getImageUrl(file) {
    if (file instanceof Blob || file instanceof File) return null; // handled separately
    return file.url ?? file.image_url ?? file.file_url ?? file.thumbnail_url ?? null;
}

function ImageFileThumbnail({ file }) {
    const isBlobOrFile = file instanceof Blob || file instanceof File;
    const [url, setUrl] = useState(() =>
        isBlobOrFile ? URL.createObjectURL(file) : getImageUrl(file)
    );
    useEffect(() => {
        if (isBlobOrFile && url) return () => URL.revokeObjectURL(url);
    }, [isBlobOrFile, url]);
    if (url) return <img src={url} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />;
    return (
        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-teal-600 shrink-0">
            <i className="fas fa-file-image text-white text-xl" />
        </div>
    );
}

function isImageFile(file) {
    const type = file.type ?? file.content_type ?? "";
    return type.startsWith("image/");
}

function FileMetadataBox({ uploadedFiles, setUploadedFiles, styles=null }) {
    if (uploadedFiles?.length) {
        return (
            // <div
            //     id="file-metadata-box"
            //     className={`${styles.position} top-0 left-0 z-10
            //                         flex flex-row gap-2
            //                         p-2 ${styles.pt} rounded-t-xl max-w-full
            //                         ${uploadedFiles.length > 0 ? "" : "hidden"}
            //                     `}
            // >
                <div className={`gap-2 flex flex-row overflow-x-auto 
                                        scrollbar-hide scroll-smooth rounded-lg ${styles}`}>
                    {uploadedFiles.map((file, index) => (
                        <div
                            key={file?.imageUrl ?? `file-${index}-${file?.name ?? ''}-${(file?.size ?? '')}`}
                            className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg"
                        >
                            {/* File icon or image thumbnail (show spinner while image is loading) */}
                            <div className={`rounded-md w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden ${file.loading ? "bg-gray-200" : isImageFile(file) ? "" : "bg-teal-600"}`}>
                                {file.loading ? (
                                    <span className="text-gray-400" aria-hidden>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    </span>
                                ) : isImageFile(file) ? (
                                    <ImageFileThumbnail file={file} />
                                ) : (file.type ?? file.content_type) === "application/pdf" ? (
                                    <i className="fas fa-file-pdf text-white text-xl" />
                                ) : (file.type ?? file.content_type) === "text/plain" ? (
                                    <i className="fas fa-file-lines text-white text-xl" />
                                ) : (file.type ?? file.content_type) === "text/csv" ? (
                                    <i className="fas fa-file-csv text-white text-xl" />
                                ) : (file.type ?? file.content_type) ===
                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                                    <i className="fas fa-file-word text-white text-xl" />
                                ) : (file.type ?? file.content_type) ===
                                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                                    <i className="fas fa-file-excel text-white text-xl" />
                                ) : (file.type ?? file.content_type) === "application/vnd.ms-excel" ? (
                                    <i className="fas fa-file-excel text-white text-xl" />
                                ) : (file.type ?? file.content_type) ===
                                    "application/vnd.openxmlformats-officedocument.presentationml.presentation" ? (
                                    <i className="fas fa-file-powerpoint text-white text-xl" />
                                ) : (
                                    <i className="fas fa-file text-white text-xl" />
                                )}
                            </div>

                            {/* File metadata */}
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-gray-700 font-semibold truncate">
                                    {file.loading ? "Loading image..." : (() => {
                                        const name = file.name ?? file.file_name ?? "";
                                        return name.length > 10 ? name.slice(0, 10) + "..." : name;
                                    })()}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {file.loading ? "" : `${((file.size ?? file.file_size ?? 0) / 1024).toFixed(1)} KB`}
                                </div>
                            </div>

                            {/* Remove file */}
                            {setUploadedFiles &&
                                <button
                                    type="button"
                                    onClick={() =>
                                        setUploadedFiles((prev) =>
                                            prev.filter((f) => f !== file)
                                        )
                                    }
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    <i className="fas fa-times" />
                                </button>
                            }
                        </div>
                    ))}
                </div>
            // </div>
        )
    } else {
        return <></>
    }

}

export default FileMetadataBox