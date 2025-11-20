import React from 'react';
import type { Place } from '../hooks/usePlaces';
import './PlaceCard.css';

interface Props {
  place: Place;
  onClick?: (id: number) => void;
}

const PlaceCard: React.FC<Props> = ({ place, onClick }) => {
  return (
    <div className="place-card" onClick={() => onClick && onClick(place.id)}>
      <img src={place.image} alt={place.name} className="place-card-image" />
      <div className="place-card-title">{place.name}</div>
    </div>
  );
};

export default PlaceCard;
