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

export default function SearchResult({ response: initResponse, prompt: initPrompt, pk: initPk, onSearch }) {
  const [response, setResponse] = useState(initResponse)
  const [prompt, setPrompt] = useState(initPrompt)
  const [pk, setPk] = useState(initPk)
  // const [onSearch, setOnSearch] = useState(initOnSearch)


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
      console.log(err)
      showCustomToast("Something went wrong!", { type: "error" })
    }
  }

  useEffect(() => {
    if (chatId) {
      fetchSharedChat(chatId)
    }
  }, [])

  // return null






  const { logoutAndNavigate } = useAuthUtils();

  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);

  const images = response?.images?.map(img => ({
    src: img.image_url,
    url: img.origin_url,
  }));

  const content = response ? structuredData(
    response.choices[0].message.content,
    response.citations_metadata || []
  ) : null;





  return (
    <>
      {response && (
        <div id={pk}>
          <div className="animate-fade-in text-left mb-8 p-6 bg-white rounded-lg border border-gray-200 relative">
            <SearchQueryContainer
              query={prompt}
              uniqueId={uniqueId}
              searchResultId={pk}
              onSearch={onSearch}
            />

            <SearchImagesContainer images={images} />

            <SearchResponseContainer content={content} uniqueId={uniqueId} searchResultId={response.pk} />
            {!chatId &&
              <SearchExportOptions
                searchResultId={pk}
                uniqueId={uniqueId}
                response={response}
                onSearch={onSearch}
                prompt={prompt}
              />
            }
          </div>
          {!chatId &&
            <RelatedQuestionsContainer
              relatedQuestions={response.related_questions}
              searchResultId={pk}
              onSearch={onSearch}
            />
          }
        </div>
      )}
    </>
  );
}
