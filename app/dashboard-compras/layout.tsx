'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, LogOut } from 'lucide-react';
import './dashboard-styles.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('usuarioLogueado') === 'true';
    const userData = localStorage.getItem('usuarioData');

    if (!isAuthenticated || !userData) {
      router.push('/');
      return;
    }

    try {
      const userDataParsed = JSON.parse(userData);
      if (userDataParsed.rol !== 'compras') {
        router.push('/dashboard');
        return;
      }
      setUser(userDataParsed);
    } catch (error) {
      console.error('Error al analizar los datos del usuario:', error);
      router.push('/');
      return;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('usuarioData');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        {/* Navbar superior */}
        <nav className="dashboard-nav">
          <div className="nav-container">
            <div className="nav-brand">
              <Link href="/dashboard-compras" className="brand-link">
                Sistema de Requisiciones
              </Link>
              <span className="brand-subtitle">Departamento de Compras</span>
            </div>
            <div className="nav-actions">
              <span className="user-badge">
                <ShoppingCart className="user-badge-icon" />
                {user?.email || 'Usuario'}
              </span>
              <button className="logout-button" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="page-content">
          <div className="content-wrapper">{children}</div>
        </main>
      </div>
    </div>
  );
}
