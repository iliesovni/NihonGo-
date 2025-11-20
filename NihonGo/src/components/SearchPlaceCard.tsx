import React from 'react';
import type { Place } from '../hooks/usePlaces';
import { getCityName, getRegionName, getTagName } from '../hooks/usePlaces';
import './SearchPlaceCard.css';

interface Props {
  place: Place;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

const SearchPlaceCard: React.FC<Props> = ({ place, isFavorite, onToggleFavorite }) => {
  return (
    <article className="search-card">
      <div className="search-card-media">
        <img src={place.image} alt={place.name} />
        <button className={`fav-btn ${isFavorite ? 'active' : ''}`} onClick={() => onToggleFavorite(place.id)} aria-label="Favoris">♡</button>
        <div className="search-card-pop">{place.popularity}% populaire</div>
      </div>
      <div className="search-card-body">
        <h3 className="search-card-title">{place.name}</h3>
        <div className="search-card-sub"><span className="loc-icon">📍</span> {getCityName(place.cityId)}, {getRegionName(place.regionId)}</div>
        <p className="search-card-desc">{(place.description ?? '').length > 110 ? `${(place.description ?? '').slice(0,110)}...` : (place.description ?? '')}</p>
        <div className="search-card-meta">
          <div className="meta-left">
            <span className="duration"><span className="clock">⏱</span> {place.duration ?? ''}</span>
          </div>
          <div className="meta-right">
            <span className={`price ${place.price === 0 ? 'free' : ''}`}>{typeof place.price === 'number' ? (place.price === 0 ? 'Gratuit' : `¥ ${place.price}`) : ''}</span>
          </div>
        </div>
        <div className="search-card-tags">
          {place.tags?.slice(0,3).map((t) => (
            <span key={t} className="tag">{getTagName(t)}</span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default SearchPlaceCard;
