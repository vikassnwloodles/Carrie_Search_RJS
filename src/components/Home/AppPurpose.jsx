import { Link } from "react-router-dom";

function AppPurpose() {
    return (
        <div className="mt-6 p-4 bg-stone-100 rounded-lg text-sm text-gray-700 flex flex-col gap-10">
            <h2 className="text-3xl mb-4 text-[#652F74]">What is <span className="font-semibold">Ask Carrie?</span></h2>

            <div className="flex flex-row items-center gap-4">
                <div className="bg-[#652F74] text-white p-3 rounded-full">
                    <i className="fa fa-search text-3xl"></i>
                </div>
                <p className="mb-2 text-lg">
                    Ask Carrie is an AI-powered search and document analysis platform that helps
                    users search, analyze, and summarize their own files and online content.
                </p>
            </div>

            <div className="flex flex-row items-center gap-4">
                <div className="bg-[#652F74] text-white p-3 rounded-full">
                    <i className="fa fa-folder text-3xl"></i>
                </div>
                <p className="mb-2 text-lg">
                    Users can optionally connect Google Drive to securely select files for
                    analysis. Ask Carrie only accesses files explicitly chosen by the user and
                    does not modify, delete, or share Google Drive data.
                </p>
            </div>

            {/* <div className="mt-3 flex gap-4">
                <Link
                    to="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#652F74] hover:underline"
                >
                    Privacy Policy
                </Link>

                <Link
                    to="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#652F74] hover:underline"
                >
                    Terms & Conditions
                </Link>
            </div> */}
        </div>
    )
}

export default AppPurpose