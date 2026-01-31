import { Link } from "react-router-dom";

function AppPurpose() {
    return (
        <div className="w-full max-w-4xl mt-6 p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
            <h2 className="text-lg font-semibold mb-2">What is Ask Carrie?</h2>

            <p className="mb-2">
                Ask Carrie is an AI-powered search and document analysis platform that helps
                users search, analyze, and summarize their own files and online content.
            </p>

            <p className="mb-2">
                Users can optionally connect Google Drive to securely select files for
                analysis. Ask Carrie only accesses files explicitly chosen by the user and
                does not modify, delete, or share Google Drive data.
            </p>

            <div className="mt-3 flex gap-4">
                <Link
                    to="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline"
                >
                    Privacy Policy
                </Link>

                <Link
                    to="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline"
                >
                    Terms & Conditions
                </Link>
            </div>
        </div>
    )
}

export default AppPurpose