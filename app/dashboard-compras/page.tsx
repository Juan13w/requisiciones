'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Package, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { Requisition } from '@/types/requisition';
import './dashboard-page.css';

export default function DashboardCompras() {
  const router = useRouter();
  const [requisiciones, setRequisiciones] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("usuarioLogueado") === "true";
    const userData = localStorage.getItem("usuarioData");
    
    if (!isAuthenticated || !userData) {
      router.push("/");
      return;
    }

    // Verificar que el usuario sea de compras
    try {
      const user = JSON.parse(userData);
      if (user.rol !== 'compras') {
        router.push('/dashboard');
        return;
      }

      // Cargar estadísticas (simuladas por ahora)
      setStats({
        total: 42,
        pendientes: 12,
        aprobadas: 25,
        rechazadas: 5
      });
    } catch (error) {
      console.error('Error al analizar los datos del usuario:', error);
      router.push("/");
      return;
    }

    // Cargar requisiciones
    const cargarRequisiciones = async () => {
      try {
        const response = await fetch('/api/requisiciones');
        if (!response.ok) {
          throw new Error('Error al cargar las requisiciones');
        }
        const data = await response.json();
        setRequisiciones(data);
      } catch (error) {
        console.error('Error al cargar las requisiciones:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarRequisiciones();
  }, [router]);

  const getStatusBadge = (status: string | undefined) => {
    // Default to empty string if status is undefined
    const statusLower = (status || '').toLowerCase();
    let icon;
    let className = 'status-badge';
    
    if (statusLower === 'pendiente') {
      icon = <Clock className="status-icon" />;
      className += ' status-pending';
    } else if (statusLower === 'aprobada') {
      icon = <CheckCircle className="status-icon" />;
      className += ' status-approved';
    } else if (statusLower === 'rechazada') {
      icon = <AlertCircle className="status-icon" />;
      className += ' status-rejected';
    } else {
      // Default case for unknown or empty status
      return <span className={`${className} status-pending`}><Clock className="status-icon" />Pendiente</span>;
    }
    
    return (
      <span className={className}>
        {icon}
        {status}
      </span>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('usuarioData');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Panel de Control</h1>
        <div className="header-actions">
          <button className="generate-report-btn">
            <FileText className="btn-icon" />
            Generar Reporte
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Requisiciones</span>
            <FileText className="stat-icon" />
          </div>
          <div className="stat-card-content">
            <div className="stat-value">{stats.total}</div>
            <p className="stat-description">+20.1% del mes pasado</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pendientes</span>
            <Clock className="stat-icon" />
          </div>
          <div className="stat-card-content">
            <div className="stat-value">{stats.pendientes}</div>
            <p className="stat-description">+5 desde ayer</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Aprobadas</span>
            <CheckCircle className="stat-icon" />
          </div>
          <div className="stat-card-content">
            <div className="stat-value">{stats.aprobadas}</div>
            <p className="stat-description">+12% del mes pasado</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Rechazadas</span>
            <AlertCircle className="stat-icon" />
          </div>
          <div className="stat-card-content">
            <div className="stat-value">{stats.rechazadas}</div>
            <p className="stat-description">-2 desde ayer</p>
          </div>
        </div>
      </div>

      {/* Tabla de requisiciones recientes */}
      <div className="recent-requisitions">
        <div className="section-header">
          <h2>Requisiciones Recientes</h2>
          <p className="section-description">Las últimas 10 requisiciones registradas en el sistema.</p>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Empresa</th>
                <th>Solicitante</th>
                <th>Fecha</th>
                <th>Proceso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requisiciones.length > 0 ? (
                requisiciones.slice(0, 10).map((req) => (
                  <tr key={req.id}>
                    <td>#{req.consecutivo}</td>
                    <td>{req.empresa}</td>
                    <td>{req.nombreSolicitante}</td>
                    <td>{new Date(req.fechaSolicitud).toLocaleDateString()}</td>
                    <td>{req.proceso}</td>
                    <td>{getStatusBadge(req.estado)}</td>
                    <td>
                      <button 
                        className="action-btn" 
                        onClick={() => router.push(`/dashboard-compras/requisiciones/${req.id}`)}
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="no-records">
                    <div className="no-records-content">
                      <Package className="no-records-icon" />
                      <p>No hay requisiciones registradas</p>
                      <button 
                        className="create-btn"
                        onClick={() => router.push('/dashboard-compras/requisiciones/nueva')}
                      >
                        Crear Requisición
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {requisiciones.length > 0 && (
          <div className="table-footer">
            <button 
              className="view-all-btn"
              onClick={() => router.push('/dashboard-compras/requisiciones')}
            >
              Ver todas las requisiciones
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
