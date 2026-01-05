import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    // Ensure page starts from top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg p-6 text-gray-800 text-sm leading-relaxed">
        
        <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
          <p>
            Welcome to <strong>Ask Carrie</strong> (“we”, “our”, “us”). Ask Carrie
            is an AI-powered search and document analysis platform designed to help
            users search, analyze, and summarize their own files and content.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">2. Information We Collect</h2>

          <p className="mb-2 font-medium">a. Information You Provide</p>
          <p className="mb-4">
            We may collect information that you voluntarily provide, such as search
            queries, prompts, uploaded files, or content you choose to analyze.
          </p>

          <p className="mb-2 font-medium">b. Google Drive Data</p>
          <p>
            If you choose to connect Google Drive, Ask Carrie accesses only files
            explicitly selected by you using read-only permissions. We do not
            modify, delete, or share your Google Drive files.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">3. How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide AI-powered search and analysis features</li>
            <li>To process user-selected content</li>
            <li>To improve platform reliability and performance</li>
            <li>To maintain security and prevent misuse</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            4. Google API Services User Data Policy
          </h2>
          <p>
            Ask Carrie’s use and transfer of information received from Google APIs
            adheres to the <strong>Google API Services User Data Policy</strong>,
            including the Limited Use requirements. Google user data is used only
            to provide requested functionality and is not used for advertising or
            shared with third parties.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">5. Data Security</h2>
          <p>
            We implement reasonable technical and organizational safeguards to
            protect user data against unauthorized access, loss, or misuse.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">6. Data Retention</h2>
          <p>
            Data is retained only for as long as necessary to provide services or
            comply with legal obligations. Users may request data deletion by
            contacting us.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">7. Third-Party Services</h2>
          <p>
            Ask Carrie may rely on trusted third-party infrastructure providers.
            These providers are contractually obligated to protect user data.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">8. Children’s Privacy</h2>
          <p>
            Ask Carrie is not intended for children under the age of 13. We do not
            knowingly collect personal information from children.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be
            posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us
            at:
          </p>
          <p className="mt-2">
            <strong>Email:</strong>{" "}
            <a
              href="mailto:support@ask-carrie.ai"
              className="text-teal-600 hover:underline"
            >
              support@ask-carrie.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
