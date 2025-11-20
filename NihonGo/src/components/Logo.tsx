import React from 'react';
import logoSrc from '../assets/logo.png';

const Logo: React.FC = () => {
  return (
    <div className="site-logo">
      <img src={logoSrc} alt="Nihongo logo" />
    </div>
  );
};

export default Logo;
