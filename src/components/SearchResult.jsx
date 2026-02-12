import SearchQueryContainer from "./SearchQueryContainer";
import SearchImagesContainer from "./SearchImagesContainer";
import SearchResponseContainer from "./SearchResponseContainer";
import SearchExportOptions from "./SearchExportOptions";
import RelatedQuestionsContainer from "./RelatedQuestionsContainer";
import { structuredData } from "../utils/structuredData";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";
import FileMetadataBox from "./SearchForm/FileMetadataBox";
import SelectedTextContainer from "./SearchForm/SelectedTextContainer";

export default function SearchResult({ response: initResponse, prompt: initPrompt, pk, threadId, uploadedFiles, setSelectedText, selected_text }) {
  const { logoutAndNavigate } = useAuthUtils();
  // const [pk, setPk] = useState(initPk)
  const [response, setResponse] = useState(initResponse)
  const [prompt, setPrompt] = useState(initPrompt)

  const { chatId } = useParams();

  async function fetchSharedChat(chatId) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/public-chat/${chatId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      const resJson = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", {
            type: "warn",
          });
          logoutAndNavigate();
        } else {
          showCustomToast(resJson, { type: "error" });
        }
      } else {
        setResponse(resJson.response)
        setPrompt(resJson.prompt)
        setPk(resJson.id)
      }
    } catch (err) {
      showCustomToast("Something went wrong!", { type: "error" })
    }
  }

  useEffect(() => {
    if (chatId) {
      fetchSharedChat(chatId)
    }
  }, [])

  // return null

  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);

  const images = response?.images?.map(img => ({
    src: img.image_url,
    url: img.origin_url,
  }));

  // const content = response ? structuredData(
  //   response.choices[0].message.content,
  //   response.citations_metadata || []
  // ) : null;



  const content = response ? structuredData(
    response.choices?.[0]?.message?.content ?? response.content?.[0]?.text,
    response.citations_metadata ?? []
  ) : null;

  const image_url = response.content?.[0]?.image_url
  const doc_url = response.content?.[0]?.doc_url
  const doc_name = response.content?.[0]?.doc_name


  return (
    <>
      {response && (
        <div id={pk}>
          <div className="animate-fade-in text-left mb-8 p-6 rounded-lg relative">
            {selected_text &&
              <div className="mb-2">
                <SelectedTextContainer selectedText={selected_text} />
              </div>
            }
            <div className="mb-2">
              <FileMetadataBox uploadedFiles={uploadedFiles} setUploadedFiles={null} />
            </div>
            <SearchQueryContainer
              query={prompt}
              uniqueId={uniqueId}
              searchResultId={pk}
              threadId={threadId}
              chatId={chatId}
              uploadedFiles={uploadedFiles}
              // width={`w-96`}
            />

            <SearchImagesContainer images={images} />

            <SearchResponseContainer
              content={content}
              imageURL={image_url}
              uniqueId={uniqueId}
              searchResultId={pk}
              setSelectedText={setSelectedText}
              docUrl={doc_url}
              docName={doc_name}
            />
            {!chatId &&
              <SearchExportOptions
                searchResultId={pk}
                uniqueId={uniqueId}
                response={response}
                prompt={prompt}
                threadId={threadId}
              />
            }
          </div>
          {!chatId &&
            <RelatedQuestionsContainer
              relatedQuestions={response.related_questions}
              searchResultId={pk}
            />
          }
        </div>
      )}
    </>
  );
}
