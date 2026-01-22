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
          Ask Carrie Training: Master the Art of Effective Prompts
        </h2>

        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Join us weekly to unlock Carrie&apos;s full potential and learn how to write prompts that get better answers,
          faster results, and work that feels expert-level.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          What You&apos;ll Learn
        </h2>

        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          We&apos;ll dive into the three pillars of powerful prompting—<b>Who</b>, <b>What</b>, and <b>How You Feel</b>—so you
          can communicate with AI like briefing a trusted colleague.
        </p>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Who: Tell Carrie Its Role
        </h3>

        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          Give Carrie a persona to guide its tone and depth. Instead of generic questions, assign a role:
        </p>

        <ul className="list-disc list-inside text-lg text-gray-700 mb-6 space-y-1">
          <li>&quot;You are a grant writing consultant with 20 years of nonprofit experience.&quot;</li>
          <li>&quot;You are a political campaign strategist focused on Missouri voter outreach.&quot;</li>
          <li>&quot;You are a digital equity director who understands rural broadband challenges.&quot;</li>
        </ul>

        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          When Carrie knows who it is, it responds with the expertise that role demands.
        </p>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          What: Be Clear About the Task
        </h3>

        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          Specify exactly what you need—write, analyze, compare, summarize. The clearer your ask, the sharper the output:
        </p>

        <ul className="list-disc list-inside text-lg text-gray-700 mb-6 space-y-1">
          <li>&quot;Write a 250-word executive summary for a digital literacy grant targeting K–12 students.&quot;</li>
          <li>&quot;Compare three nonprofit CRM platforms and recommend the best for small budgets.&quot;</li>
          <li>&quot;Create a three-email fundraising sequence ending with a gala invitation.&quot;</li>
        </ul>

        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Include format, length, audience, and outcome so Carrie delivers something you can actually use.
        </p>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          How You Feel: Add Context and Constraints
        </h3>

        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          Share why this matters or what success looks like. This helps Carrie prioritize:
        </p>

        <ul className="list-disc list-inside text-lg text-gray-700 mb-6 space-y-1">
          <li>&quot;I&apos;m on a tight deadline and need professional but approachable—not too stiff.&quot;</li>
          <li>&quot;This goes to the board, so I need confidence-building language with data.&quot;</li>
          <li>&quot;I want hopeful and mission-driven, not corporate jargon—our community deserves better.&quot;</li>
        </ul>

        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          When you share how you feel, Carrie adjusts tone and structure to match your goals.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Weekly Training Sessions
        </h2>

        <ul className="list-disc list-inside text-lg text-gray-700 mb-6 space-y-1">
          <li><b>When:</b> Every week (schedule announced in community)</li>
          <li><b>What to Expect:</b> Live walk-throughs, real examples, before-and-after comparisons, hands-on practice</li>
          <li>
            <b>Who Should Attend:</b> Grant writers, nonprofit leaders, campaign managers, marketers, educators—anyone who
            wants AI that works the way they think
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Why This Matters
        </h2>

        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Most people use AI like a search engine and hope for the best. You&apos;ll learn to use Carrie like a strategic
          partner: give it a role, a clear task, and an honest perspective—and get work custom-built for your mission.
        </p>

        <p className="text-lg text-gray-800 leading-relaxed font-semibold text-center mt-8">
          Sign up for Ask Carrie Training and transform how you work with AI.
        </p>

      </div>
    </div>
  );
}
