'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Importaciones dinámicas para evitar problemas de SSR
const MainPage = dynamic(() => import('@/components/MainPage'), { ssr: false });
const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false });
const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });
const Footer = dynamic(
  () => import('@/components/Footer').then((mod) => mod.Footer),
  { ssr: false }
);

interface UserData {
  id: number;
  email: string;
  rol: 'coordinador' | 'compras';
  isAdmin?: boolean; // Mantener por compatibilidad
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Verificar autenticación al cargar
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      const usuarioLogueado = localStorage.getItem('usuarioLogueado') === 'true';
      const usuarioData = localStorage.getItem('usuarioData');
      
      if (usuarioLogueado && usuarioData) {
        setUser(JSON.parse(usuarioData));
      }
    }
  }, []);

  // Manejar el inicio de sesión exitoso
  const handleLogin = (userData: UserData) => {
    setUser(userData);
    // No es necesario redirigir aquí, el efecto se encargará
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('usuarioLogueado');
      localStorage.removeItem('usuarioData');
    }
    setUser(null);
    router.push('/');
  };

  // Mostrar un estado de carga mientras se determina la autenticación
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si el usuario está autenticado, mostrar el Dashboard
  if (user) {
    return <Dashboard />;
  }

  // Si no está autenticado, mostrar la página principal con el formulario de login
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <MainPage onLogin={handleLogin} />
      </main>
      <Footer />
    </div>
  );
}

