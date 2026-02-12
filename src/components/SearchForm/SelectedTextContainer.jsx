import React from 'react'

function SelectedTextContainer({ selectedText, setSelectedText, styles = null }) {
    if (!selectedText?.trim()) return <></>
    return (
        // <div
        //     id="file-metadata-box"
        //     className={`${styles.position} top-0 left-0 z-10
        //                             flex flex-row gap-2
        //                             p-2 ${styles.pt} rounded-t-xl max-w-full
        //                         `}
        // >
        <div className={`gap-2 flex flex-row overflow-x-auto 
                                        scrollbar-hide scroll-smooth rounded-lg ${styles}`}>
            <div
                className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg"
            >
                {/* Quote icon */}
                <div className="rounded-md w-10 h-10 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-quote-left"></i>
                </div>

                {/* Selected Text */}
                <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-700">
                        {selectedText.slice(0, 200)}...
                    </div>
                </div>

                {/* Remove file */}
                {setSelectedText &&
                    <button
                        type="button"
                        onClick={() =>
                            setSelectedText("")
                        }
                        className="text-gray-500 hover:text-gray-800 w-10 h-10"
                    >
                        <i className="fas fa-times" />
                    </button>
                }
            </div>
        </div>
        // </div>
    )
}

export default SelectedTextContainer