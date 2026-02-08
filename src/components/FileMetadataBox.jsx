import React from 'react'

function FileMetadataBox({ uploadedFiles, setUploadedFiles, styles={position: "absolute", pt: "pt-2"} }) {
    if (uploadedFiles?.length) {
        return (
            <div
                id="file-metadata-box"
                className={`${styles.position} top-0 left-0 z-10
                                    flex flex-row gap-2
                                    p-2 ${styles.pt} rounded-t-xl max-w-full
                                    ${uploadedFiles.length > 0 ? "" : "hidden"}
                                `}
            >
                <div className='gap-2 flex flex-row overflow-x-auto 
                                        scrollbar-hide scroll-smooth rounded-lg'>
                    {uploadedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg"
                        >
                            {/* File icon */}
                            <div className="bg-teal-600 rounded-md w-10 h-10 flex items-center justify-center shrink-0">
                                {file.type === "application/pdf" ? (
                                    <i className="fas fa-file-pdf text-white text-xl" />
                                ) : file.type === "text/plain" ? (
                                    <i className="fas fa-file-lines text-white text-xl" />
                                ) : file.type === "text/csv" ? (
                                    <i className="fas fa-file-csv text-white text-xl" />
                                ) : file.type.startsWith("image/") ? (
                                    <i className="fas fa-file-image text-white text-xl" />
                                ) : file.type ===
                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                                    <i className="fas fa-file-word text-white text-xl" />
                                ) : file.type ===
                                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                                    <i className="fas fa-file-excel text-white text-xl" />
                                ) : file.type ===
                                    "application/vnd.openxmlformats-officedocument.presentationml.presentation" ? (
                                    <i className="fas fa-file-powerpoint text-white text-xl" />
                                ) : (
                                    <i className="fas fa-file text-white text-xl" />
                                )}
                            </div>

                            {/* File metadata */}
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-gray-700 font-semibold truncate">
                                    {(file.name.length > 10) ? file.name.slice(0, 10) + `...` : file.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB
                                </div>
                            </div>

                            {/* Remove file */}
                            {setUploadedFiles &&
                                <button
                                    type="button"
                                    onClick={() =>
                                        setUploadedFiles((prev) =>
                                            prev.filter((_, i) => i !== index)
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
            </div>
        )
    } else {
        return <></>
    }

}

export default FileMetadataBox