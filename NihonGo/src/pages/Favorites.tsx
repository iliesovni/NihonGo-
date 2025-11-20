import React from 'react';
import Navbar from '../components/Navbar';
import SearchPlaceCard from '../components/SearchPlaceCard';
import { useFavorites, usePlaceDetails } from '../hooks/usePlaces';
import './Favorites.css';

const Favorites: React.FC = () => {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const places = favorites
    .map((id) => usePlaceDetails(id))
    .filter((p) => p !== null) as any[];

  return (
    <div className="favorites-page">
      <Navbar />
      <main className="favorites-main">
        <h2>Favoris</h2>
        {places.length === 0 ? (
          <p className="empty">Vous n'avez pas encore de favoris.</p>
        ) : (
          <div className="favorites-grid">
            {places.map((p) => (
              <SearchPlaceCard key={p.id} place={p} isFavorite={isFavorite(p.id)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
