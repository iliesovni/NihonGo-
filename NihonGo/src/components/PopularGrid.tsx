import React from 'react';
import { usePopularPlaces } from '../hooks/usePlaces';
import PlaceCard from './PlaceCard';
import './PopularGrid.css';

const PopularGrid: React.FC = () => {
  const places = usePopularPlaces(6);

  const handleClick = (id: number) => {
    window.location.hash = `#/place/${id}`;
  };

  return (
    <section className="popular-section">
      <h2 className="section-title">Les incontournables</h2>
      <div className="popular-grid">
        {places.map((p) => (
          <PlaceCard key={p.id} place={p} onClick={handleClick} />
        ))}
      </div>
    </section>
  );
};

export default PopularGrid;
