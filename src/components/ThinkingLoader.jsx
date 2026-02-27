import React from 'react'

function ThinkingLoader({ text }) {
    return (
        <div className="flex items-center space-x-3 py-1">
            <div className="relative">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            </div>
            {text ? <span className="text-gray-600 text-sm">{text}</span> : null}
        </div>
    );
}

export default ThinkingLoader