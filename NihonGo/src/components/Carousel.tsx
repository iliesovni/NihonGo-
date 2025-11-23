import React, { useState, useEffect } from 'react';
import { usePopularPlaces } from '../hooks/usePlaces';
import './Carousel.css';

const Carousel: React.FC = () => {
  const slides = usePopularPlaces(3);
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const prev = () => {
    if (isTransitioning) return;
    setDirection('left');
    setIsTransitioning(true);
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  };

  const next = () => {
    if (isTransitioning) return;
    setDirection('right');
    setIsTransitioning(true);
    setIndex((i) => (i + 1) % slides.length);
  };

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, index]);

  if (!slides.length) return null;

  return (
    <div className="hero-carousel">
      <button className="carousel-control left" onClick={prev} aria-label="Précédent">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="carousel-container">
        <div 
          className={`carousel-slide-wrapper ${isTransitioning ? `transitioning-${direction}` : ''}`}
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="carousel-slide">
              <img src={slide.image} alt={slide.name} className="carousel-image" />
              <div className="carousel-gradient"></div>
              <div className="carousel-overlay">
                <h1 className="carousel-title">Créez l'itineraire qui vous correspond</h1>
                <h2 className="carousel-place">{slide.name}</h2>
                <p className="carousel-short">{slide.shortDescription}</p>
                <a className="carousel-cta" href={`#/place/${slide.id}`}>
                  <span>Y aller</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="carousel-control right" onClick={next} aria-label="Suivant">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="carousel-indicators">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`carousel-indicator ${i === index ? 'active' : ''}`}
            onClick={() => {
              if (!isTransitioning) {
                setDirection(i > index ? 'right' : 'left');
                setIsTransitioning(true);
                setIndex(i);
              }
            }}
            aria-label={`Aller à la slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
