import React from 'react';
import { useSearchPlaces, useFavorites, allTypes, allCities } from '../hooks/usePlaces';
import Navbar from '../components/Navbar';
import SearchPlaceCard from '../components/SearchPlaceCard';
import './Search.css';

const Search: React.FC = () => {
  const {
    query,
    setQuery,
    type,
    setType,
    city,
    setCity,
    price,
    setPrice,
    sortBy,
    setSortBy,
    results,
    total,
  } = useSearchPlaces();

  const { toggleFavorite, isFavorite } = useFavorites();

  return (
    <div className="search-page">
      <Navbar />
      <div className="search-controls">
        <input className="search-input" placeholder="Recherchez des lieux, temples, jardins..." value={query} onChange={(e) => setQuery(e.target.value)} />

        <div className="filters">
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Tous les types</option>
              {allTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>

          <label>
            Ville
            <select value={city} onChange={(e) => setCity(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Toutes les villes</option>
              {allCities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label>
            Prix
            <select value={price} onChange={(e) => setPrice(e.target.value)}>
              <option value="">Tous les prix</option>
              <option value="free">Gratuit</option>
              <option value="low">≤ 500</option>
              <option value="mid">501 - 1500</option>
              <option value="high">&gt; 1500</option>
            </select>
          </label>

          <label>
            Trier par
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="popularity_desc">Popularité</option>
              <option value="alphabetical_asc">A → Z</option>
              <option value="alphabetical_desc">Z → A</option>
              <option value="price_asc">Prix ↑</option>
              <option value="price_desc">Prix ↓</option>
            </select>
          </label>
        </div>
      </div>

      <div className="results-count">{total} Résultats</div>

      <div className="results-grid">
        {results.map((p) => (
          <SearchPlaceCard key={p.id} place={p} isFavorite={isFavorite(p.id)} onToggleFavorite={toggleFavorite} />
        ))}
      </div>
    </div>
  );
};

export default Search;
