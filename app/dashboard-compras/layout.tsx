'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ShoppingCart, FileText, Users, Settings, LogOut } from 'lucide-react';
import './dashboard-styles.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{email: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("usuarioLogueado") === "true";
    const userData = localStorage.getItem("usuarioData");
    
    if (!isAuthenticated || !userData) {
      router.push("/");
      return;
    }

    // Verificar que el usuario sea de compras
    try {
      const userDataParsed = JSON.parse(userData);
      if (userDataParsed.rol !== 'compras') {
        router.push('/dashboard');
        return;
      }
      setUser(userDataParsed);
    } catch (error) {
      console.error('Error al analizar los datos del usuario:', error);
      router.push("/");
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '0.25rem solid #e5e7eb',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-header">
            <h1>Área de Compras</h1>
          </div>
          
          {/* Navegación */}
          <nav className="sidebar-nav">
            <Link href="/dashboard-compras" className="nav-link">
              <LayoutDashboard className="nav-icon" />
              <span>Inicio</span>
            </Link>
            <Link href="/dashboard-compras/requisiciones" className="nav-link">
              <FileText className="nav-icon" />
              <span>Requisiciones</span>
            </Link>
            <Link href="/dashboard-compras/proveedores" className="nav-link">
              <Users className="nav-icon" />
              <span>Proveedores</span>
            </Link>
            <Link href="/dashboard-compras/reportes" className="nav-link">
              <FileText className="nav-icon" />
              <span>Reportes</span>
            </Link>
            <Link href="/dashboard-compras/configuracion" className="nav-link">
              <Settings className="nav-icon" />
              <span>Configuración</span>
            </Link>
          </nav>
          
          {/* Pie de página */}
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <span>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</span>
              </div>
              <div className="user-details">
                <p className="user-email">{user?.email || 'Usuario'}</p>
                <p className="user-role">Área de Compras</p>
              </div>
            </div>
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut className="logout-icon" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="main-content">
        {/* Barra superior */}
        <header className="top-bar">
          <div className="top-bar-content">
            <h2>Panel de Control</h2>
            <div className="top-bar-actions">
              <span className="date-display">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <div className="user-avatar-small">
                <span>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Contenido de la página */}
        <main className="page-content">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
