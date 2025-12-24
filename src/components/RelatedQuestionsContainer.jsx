export default function RelatedQuestionsContainer({ relatedQuestions, searchResultId, onSearch }) {
  if (!relatedQuestions || relatedQuestions.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="text-lg font-medium mb-3">Related</h3>

      {relatedQuestions.map((q, i) => (
        <div
          key={i}
          className="py-2 border-t cursor-pointer hover:text-teal-600 flex justify-between"
          onClick={() => onSearch(q)}
        >
          <span>{q}</span>
          <span>+</span>
        </div>
      ))}
    </div>
  );
}
