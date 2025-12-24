export default function SearchImagesContainer({ images }) {
  if (!images || images.length === 0) return null;

  return (
    <>
      <h3 className="text-xl font-semibold mt-6 mb-4">Related Images:</h3>

      <div className="image-carousel-wrapper">
        <button className="carousel-arrow left">
          <i className="fas fa-chevron-left" />
        </button>

        <div className="image-carousel-container">
          {images.map((img, i) => (
            <a key={i} href={img.url} target="_blank" rel="noreferrer" className="image-card">
              <img src={img.src} alt="Search result" />
            </a>
          ))}
        </div>

        <button className="carousel-arrow right">
          <i className="fas fa-chevron-right" />
        </button>
      </div>
    </>
  );
}
