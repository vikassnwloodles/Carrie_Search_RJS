import SearchQueryContainer from "./SearchQueryContainer";
import SearchImagesContainer from "./SearchImagesContainer";
import SearchResponseContainer from "./SearchResponseContainer";
import SearchExportOptions from "./SearchExportOptions";
import RelatedQuestionsContainer from "./RelatedQuestionsContainer";
import { structuredData } from "../utils/structuredData";

export default function SearchResult({ response, prompt, pk, onSearch }) {
  //   const { response, prompt } = data;
  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);

  const images = response.images?.map(img => ({
    src: img.image_url,
    url: img.origin_url,
  }));

  const content = structuredData(
    response.choices[0].message.content,
    response.citations_metadata || []
  );

  return (
    <div id={response.pk}>
      <div className="animate-fade-in text-left mb-8 p-6 bg-white rounded-lg border border-gray-200 relative">
        <SearchQueryContainer
          query={prompt}
          uniqueId={uniqueId}
          searchResultId={pk}
          onSearch={onSearch}
        />

        <SearchImagesContainer images={images} />

        <SearchResponseContainer content={content} uniqueId={uniqueId} searchResultId={response.pk} />

        <SearchExportOptions
          searchResultId={response.pk}
          uniqueId={uniqueId}
        />
      </div>

      <RelatedQuestionsContainer
        relatedQuestions={response.related_questions}
        searchResultId={pk}
        onSearch={onSearch}
      />
    </div>
  );
}
