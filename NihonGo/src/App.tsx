import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import './App.css';
import PlaceDetails from './pages/PlaceDetails';

function App() {
  const [route, setRoute] = useState(() => window.location.hash || '#/home');

  useEffect(() => {
    if (!window.location.hash) window.location.hash = '#/home';
    const onHash = () => setRoute(window.location.hash || '#/home');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  let Content = <Home />;
  if (route.startsWith('#/search')) Content = <Search />;
  if (route.startsWith('#/favorites')) Content = <Favorites />;
  if (route.startsWith('#/place/')) Content = <PlaceDetails />;

  return (
    <div className="app-root">
      {Content}
    </div>
  );
}

export default App;
