'use client';
import { useState } from "react";
import "./MainPage.css";
import Carousel from './Carousel';
import HomeFeatures from './HomeFeatures';
import LoginForm from './LoginForm';

interface MainPageProps {
  onLogin: (userData: any) => void;
}

const MainPage: React.FC<MainPageProps> = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginSuccess = (userData: any) => {
    if (onLogin) {
      onLogin(userData);
    }
  };

  return (
    <div className="main-page">
      <Carousel />
      <HomeFeatures onLoginClick={() => setShowLogin(true)} />
      
      {showLogin && (
        <LoginForm 
          isOpen={showLogin} 
          onClose={() => setShowLogin(false)} 
          onLogin={handleLoginSuccess} 
        />
      )}
    </div>
  );
};

export default MainPage;
