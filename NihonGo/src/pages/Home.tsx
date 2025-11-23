import React from 'react';
import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';
import PopularGrid from '../components/PopularGrid';
import mapSrc from '../assets/japan-map.png';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <Navbar />
      <Carousel />
      <main>
        <section className="intro">
          <div className="intro-content">
            <div className="intro-text">
              <h2 className="intro-title">Découvrez le Japon</h2>
              <p>
                Plongez au cœur du Japon et laissez-vous guider vers ses lieux les plus fascinants.
                Temples secrets, quartiers vibrants, paysages époustouflants…
              </p>
              <p>
                Explorez, filtrez et composez facilement un voyage qui vous ressemble. L'aventure commence ici.
              </p>
              <a href="#/search" className="cta-button">
                <span>Rechercher des lieux</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
            <div className="intro-map">
              <img src={mapSrc} alt="Carte du Japon" />
            </div>
          </div>
        </section>

        <PopularGrid />
      </main>
    </div>
  );
};

export default Home;
