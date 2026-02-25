import React, { forwardRef } from 'react'

const SearchSuggestionsBox = forwardRef(
    ({ searchSuggestions, handleSearchSubmit }, ref) => {
        if (!searchSuggestions || searchSuggestions.length === 0) {
            return null;
        }
        return (
            <div className="absolute top-full left-0 right-0 z-10 mt-0.5">
                {searchSuggestions.map((item, index) => (
                    <div
                        key={index}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                            if (ref?.current) {
                                ref.current.innerText = item;
                                handleSearchSubmit();
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                if (ref?.current) {
                                    ref.current.innerText = item;
                                    handleSearchSubmit();
                                }
                            }
                        }}
                        className={`
                            w-full border border-t-0 border-gray-200
                            pl-7 py-2.5 bg-white shadow-sm
                            text-left text-base
                            ${index === searchSuggestions.length - 1 ? "rounded-b-xl" : ""}
                            hover:bg-gray-50
                            cursor-pointer
                        `}
                    >
                        {item}
                    </div>
                ))}
            </div>
        );
    })

export default SearchSuggestionsBox