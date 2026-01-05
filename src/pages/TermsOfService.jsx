import { useEffect } from "react";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg p-6 text-gray-800 text-sm leading-relaxed">
        
        <h1 className="text-2xl font-semibold mb-4">Terms & Conditions</h1>
        <p className="text-gray-500 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using <strong>Ask Carrie</strong> (“the Service”),
            you agree to be bound by these Terms & Conditions. If you do not
            agree to these terms, please do not use the Service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">2. Description of Service</h2>
          <p>
            Ask Carrie is an AI-powered search and document analysis platform
            designed to help users search, analyze, and summarize their own files
            and content. Users may optionally connect third-party services, such
            as Google Drive, to select files for analysis.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You are responsible for the content you submit or analyze</li>
            <li>You must have the right to use any files or data you provide</li>
            <li>You agree not to misuse the Service or attempt unauthorized access</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">4. Third-Party Services</h2>
          <p>
            The Service may integrate with third-party services such as Google
            Drive. Use of these services is subject to their respective terms
            and policies. Ask Carrie accesses only data explicitly authorized
            by the user.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">5. Data & Privacy</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy,
            which explains how we collect and use data. By using Ask Carrie,
            you consent to data practices described in the Privacy Policy.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">6. Intellectual Property</h2>
          <p>
            All rights, title, and interest in the Service, including software,
            design, and branding, are owned by Ask Carrie or its licensors.
            These Terms do not grant you ownership of any intellectual property.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">7. Disclaimer</h2>
          <p>
            The Service is provided on an “as is” and “as available” basis.
            We do not guarantee accuracy, completeness, or reliability of
            AI-generated outputs.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Ask Carrie shall not be
            liable for any indirect, incidental, or consequential damages
            arising from use of the Service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">9. Changes to Terms</h2>
          <p>
            We may update these Terms & Conditions from time to time. Continued
            use of the Service after changes indicates acceptance of the
            updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">10. Contact Information</h2>
          <p>
            If you have any questions about these Terms & Conditions, please
            contact us at:
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
