import React, { forwardRef } from 'react'

const SearchSuggestionsBox = forwardRef(
    ({ searchSuggestions, mt, handleSearchSubmit }, ref) => {
        if (!searchSuggestions || searchSuggestions.length === 0) {
            return <></>
        } else {
            return (
                <div className={`absolute mt-${mt}`}>
                    {searchSuggestions.map((item, index) => (
                        <div
                            onClick={() => { ref.current.innerText = item; handleSearchSubmit() }}
                            key={index}
                            id="search-width"
                            className={`
                        max-w-4xl w-full
                        border border-gray-200
                        pl-7 py-2 bg-white shadow-sm
                        transition-shadow
                        ${index === searchSuggestions.length - 1 && "rounded-b-xl"}
                        focus-within:outline-none
                        focus-within:ring-2 focus-within:ring-teal-500
                        flex-col !items-start !text-left
                        cursor-pointer
                        `}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            )
        }
    })

export default SearchSuggestionsBox