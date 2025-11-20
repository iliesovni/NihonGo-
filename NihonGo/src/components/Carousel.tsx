import React, { useState } from 'react';
import { usePopularPlaces } from '../hooks/usePlaces';
import './Carousel.css';

const Carousel: React.FC = () => {
  const slides = usePopularPlaces(3);
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  if (!slides.length) return null;

  const current = slides[index];

  return (
    <div className="hero-carousel">
      <button className="carousel-control left" onClick={prev} aria-label="Précédent">‹</button>
      <div className="carousel-slide">
        <img src={current.image} alt={current.name} className="carousel-image" />
        <div className="carousel-overlay">
          <h1 className="carousel-title">Créez l'itineraire qui vous correspond</h1>
          <h2 className="carousel-place">{current.name}</h2>
          <p className="carousel-short">{current.shortDescription}</p>
          <a className="carousel-cta" href={`#/place/${current.id}`}>Y aller</a>
        </div>
      </div>
      <button className="carousel-control right" onClick={next} aria-label="Suivant">›</button>
    </div>
  );
};

export default Carousel;
