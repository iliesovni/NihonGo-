import React, { useState, useEffect } from 'react';
import { usePlaceDetails, useFavorites, usePlacesByCity, getCityName, getRegionName, getTypeName } from '../hooks/usePlaces';
import Navbar from '../components/Navbar';
import FavoriteImg from '../assets/Favorite.png';
import notFavoriteImg from '../assets/notFavorite.png';
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
  const [relatedIndex, setRelatedIndex] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false); };
    if (showModal) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  const related = usePlacesByCity(place?.cityId ?? 0, 6).filter((p) => p.id !== place?.id);
  

  const getItemsPerView = () => {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 980) return 2;
    return 3;
  };
  
  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());
  
  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());

      setRelatedIndex((prev) => {
        const maxIndex = Math.max(0, related.length - getItemsPerView());
        return Math.min(prev, maxIndex);
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [related.length]);
  
  const maxIndex = Math.max(0, related.length - itemsPerView);

  const nextRelated = () => {
    setRelatedIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevRelated = () => {
    setRelatedIndex((prev) => Math.max(prev - 1, 0));
  };

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
            <button className={`fav-detail ${isFavorite(place.id) ? 'active' : ''}`} onClick={() => toggleFavorite(place.id)} aria-label="Favoris">
              <img src={isFavorite(place.id) ? FavoriteImg : notFavoriteImg} alt={isFavorite(place.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'} className="fav-icon" />
            </button>
          </header>
          <div className="place-location">📍 {getCityName(place.cityId)}, {getRegionName(place.regionId)}</div>

          <p className="place-desc">{place.description}</p>
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

      <section className="related-section-full">
        <h3>Également dans la même ville</h3>
        {related.length === 0 ? (
          <div className="related-empty">Aucun autre endroit trouvé dans {getCityName(place.cityId)}.</div>
        ) : (
          <div className="related-carousel-container">
            <button 
              className="related-carousel-btn related-carousel-btn-left" 
              onClick={prevRelated}
              disabled={relatedIndex === 0}
              aria-label="Précédent"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="related-carousel-wrapper">
              <div 
                className="related-carousel" 
                style={{ 
                  transform: `translateX(calc(-${relatedIndex} * (100% / ${itemsPerView})))` 
                }}
              >
                {related.map((r) => (
                  <div key={r.id} className="related-thumb">
                    <a href={`#/place/${r.id}`} title={r.name}>
                      <img src={r.image} alt={r.name} />
                    </a>
                    <div className="related-caption">{r.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <button 
              className="related-carousel-btn related-carousel-btn-right" 
              onClick={nextRelated}
              disabled={relatedIndex >= maxIndex}
              aria-label="Suivant"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </section>
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
