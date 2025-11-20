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
          <div className="intro-text">
            <p>
              Plongez au cœur du Japon et laissez-vous guider vers ses lieux les plus fascinants.
              Temples secrets, quartiers vibrants, paysages époustouflants…
            </p>
            <p>
              explorez, filtrez et composez facilement un voyage qui vous ressemble. L’aventure commence ici.
            </p>
          </div>
          <div className="intro-map">
            <img src={mapSrc} alt="Carte du Japon" />
          </div>
        </section>

        <PopularGrid />
      </main>
    </div>
  );
};

export default Home;
