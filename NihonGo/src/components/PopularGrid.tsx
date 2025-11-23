import React from 'react';
import { usePopularPlaces } from '../hooks/usePlaces';
import PlaceCard from './PlaceCard';
import './PopularGrid.css';

const PopularGrid: React.FC = () => {
  const places = usePopularPlaces(6);

  const handleClick = (id: number) => {
    window.location.hash = `#/place/${id}`;
  };

  // Dupliquer les places pour créer un effet de boucle infinie
  const duplicatedPlaces = [...places, ...places, ...places];

  return (
    <section className="popular-section">
      <h2 className="section-title">Les incontournables</h2>
      <div className="popular-carousel-wrapper">
        <div className="popular-carousel">
          {duplicatedPlaces.map((p, index) => (
            <PlaceCard key={`${p.id}-${index}`} place={p} onClick={handleClick} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularGrid;
