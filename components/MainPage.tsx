'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import "./MainPage.css";
import Carousel from './Carousel';
import HomeFeatures from './HomeFeatures';
import LoginForm from './LoginForm';

interface MainPageProps {
  onLogin?: (userData: any) => void;
}

const MainPage: React.FC<MainPageProps> = ({ onLogin }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const usuarioLogueado = window.localStorage.getItem("usuarioLogueado") === "true";
    setIsLoggedIn(usuarioLogueado);
    
    // Si ya está autenticado, redirigir al panel de administración
    if (usuarioLogueado) {
      router.push('/admin');
    }
  }, [router]);

  const handleLoginSuccess = (userData: any) => {
    setIsLoggedIn(true);
    if (onLogin) {
      onLogin(userData);
    }
    // Redirigir al panel de administración después del inicio de sesión exitoso
    router.push('/admin');
  };

  if (isLoggedIn) {
    return null; // O un componente de carga mientras se redirige
  }

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
