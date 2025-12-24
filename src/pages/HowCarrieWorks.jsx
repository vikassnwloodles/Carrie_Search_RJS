// HowCarrieWorks.jsx
import React from "react";

export default function HowCarrieWorks() {
  return (
    <div className="w-full py-10 animate-fade-in px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">How Carrie Works</h1>

      <div className="max-w-4xl mx-auto mt-8">
        <div className="relative" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            src="https://www.youtube.com/embed/GTniQck-v9c"
            title="Carrie: Transforming Lives One Search at a Time!"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>

        <br />
        <br />

        <h2 className="text-3xl font-semibold text-gray-800 mb-3 mt-12">
          [VISUAL: Person frustrated at computer, screen filled with Google ads]
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          <b>NARRATOR:</b> Tired of wading through ads just to find an answer? Google's become an ad platform first,
          search engine second.
        </p>

        <h2 className="text-3xl font-semibold text-gray-800 mb-3">
          [VISUAL: Split screen - Google results crowded with ads vs someone asking ChatGPT multiple follow-up
          questions]
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          And ChatGPT? It's like talking to a kindergartener—you have to hold its hand, ask follow-up questions, and it
          has no idea what's happening in the world right now.
        </p>

        <h2 className="text-3xl font-semibold text-gray-800 mb-3">[VISUAL: Clean interface appears - "Ask Carrie" logo]</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">There's a better way. Meet Ask Carrie.</p>

        <h2 className="text-3xl font-semibold text-gray-800 mb-3">
          [VISUAL: User types question, instant comprehensive response with sources appears]
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          Ask Carrie combines the best of both worlds: real-time internet search with AI intelligence. Ask any question.
          Get one comprehensive, cited answer. No ads blocking your view. No back-and-forth kindergarten conversations.
        </p>

        <h2 className="text-3xl font-semibold text-gray-800 mb-3">[VISUAL: Examples of complex questions being answered instantly]</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          Compare products. Research breaking news. Deep-dive into any topic. Ask Carrie searches, analyzes, and
          delivers complete answers with verified sources—in seconds.
        </p>

        <h2 className="text-3xl font-semibold text-gray-800 mb-3">[VISUAL: Mobile and desktop screens]</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          The search revolution is happening now. Early adopters are already cutting their research time by 80%.
        </p>

        <h2 className="text-3xl font-semibold text-gray-800 mb-3">[VISUAL: Sign-up page]</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">Sign up today—free to start. Stop fighting ads. Stop hand-holding AI.</p>

        <h2 className="text-3xl font-semibold text-gray-800 mb-3">[VISUAL: "Ask Carrie" logo]</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">Ask Carrie. Real answers. Right now.</p>

        <p className="text-lg text-gray-700 leading-relaxed mt-8 text-center">
          Would you like me to make the competitor criticisms more or less aggressive?
        </p>
      </div>
    </div>
  );
}
