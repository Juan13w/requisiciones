'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Importación dinámica del componente PanelAdmin para evitar problemas de hidratación
const PanelAdmin = dynamic(
  () => import('@/components/PanelAdmin'),
  { ssr: false }
);

export default function AdminDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');

  // Verificar si el usuario está autenticado y obtener sus datos
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('usuarioLogueado') === 'true';
    const userData = localStorage.getItem('usuarioData');
    
    if (!isAuthenticated || !userData) {
      router.push('/');
    } else {
      try {
        const user = JSON.parse(userData);
        setUserEmail(user.email || 'Usuario');
      } catch (error) {
        console.error('Error al analizar los datos del usuario:', error);
        router.push('/');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('usuarioData');
    router.push('/');
  };

  // Mostrar un estado de carga mientras se verifica la autenticación
  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <PanelAdmin 
      user={{ email: userEmail }} 
      onLogout={handleLogout} 
    />
  );
}
