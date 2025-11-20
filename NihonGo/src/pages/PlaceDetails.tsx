import React, { useState, useEffect } from 'react';
import { usePlaceDetails, useFavorites, usePlacesByCity, getCityName, getRegionName, getTypeName } from '../hooks/usePlaces';
import Navbar from '../components/Navbar';
import './PlaceDetails.css';

function useIdFromHash() {
  const hash = window.location.hash || '';
  const m = hash.match(/#\/place\/(\d+)/);
  return m ? Number(m[1]) : null;
}

const PlaceDetails: React.FC = () => {
  const id = useIdFromHash();
  const place = usePlaceDetails(id ?? 0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false); };
    if (showModal) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  const related = usePlacesByCity(place?.cityId ?? 0, 6).filter((p) => p.id !== place?.id);

  if (!place) return (
    <div>
      <Navbar />
      <main style={{maxWidth:1200, margin:'2rem auto', padding: '0 1rem'}}>Lieu introuvable.</main>
    </div>
  );

  return (
    <div className="place-page">
      <Navbar />

      <div className="place-hero">
        <a className="back-link" href="#/search">‹</a>
        <a href={place.image} className="hero-link" aria-label={`Ouvrir ${place.name} en grand`} onClick={(e) => { e.preventDefault(); setShowModal(true); }}>
          <img src={place.image} alt={place.name} />
        </a>
      </div>

      <main className="place-main">
        <section className="place-content">
          <header className="place-header">
            <h1>{place.name}</h1>
            <button className={`fav-detail ${isFavorite(place.id) ? 'active' : ''}`} onClick={() => toggleFavorite(place.id)} aria-label="Favoris">♡</button>
          </header>
          <div className="place-location">📍 {getCityName(place.cityId)}, {getRegionName(place.regionId)}</div>

          <p className="place-desc">{place.description}</p>

          <h3>Également dans la même ville</h3>
          <div className="related-row">
            {related.length === 0 ? (
              <div className="related-empty">Aucun autre endroit trouvé dans {getCityName(place.cityId)}.</div>
            ) : (
              related.map((r) => (
                <div key={r.id} className="related-thumb">
                  <a href={`#/place/${r.id}`} title={r.name}>
                    <img src={r.image} alt={r.name} />
                  </a>
                  <div className="related-caption">{r.name}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="place-aside">
          <div className="aside-card">
            <div className="aside-label">Tarifs d'entrée</div>
            <div className="aside-price">{place.price === 0 ? 'Gratuit' : `¥ ${place.price}`}</div>

            <div className="aside-row"><span className="aside-icon">🕒</span><div>
                <div className="aside-title">Horaires</div>
                <div className="aside-text">{place.hours && place.hours.length ? place.hours : '—'}</div>
            </div></div>

            <div className="aside-row"><span className="aside-icon">⏱</span><div>
              <div className="aside-title">Durée recommandée</div>
              <div className="aside-text">{place.duration ?? ''}</div>
            </div></div>

            <div className="aside-row">
                <div className="aside-title">Popularité</div>
                <div className="pop-row">
                  <div className="pop-bar">
                    <div className="pop-fill" style={{ width: `${Math.min(100, place.popularity)}%` }} />
                  </div>
                  <div className="pop-percent">{Math.round(Math.min(100, place.popularity))}%</div>
                </div>
            </div>

            <div className="aside-row"><div className="aside-title">Type</div><div className="aside-text">{getTypeName(place.typeId)}</div></div>
          </div>
        </aside>
      </main>
      {showModal && (
        <div className="image-modal" role="dialog" aria-modal="true" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" aria-label="Fermer" onClick={() => setShowModal(false)}>✕</button>
            <img className="modal-img" src={place.image} alt={place.name} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceDetails;
