import React from 'react';
import './HomeFeatures.css';

interface HomeFeaturesProps {
  onLoginClick?: () => void;
}

// Puedes reemplazar estos emojis con iconos SVG si lo prefieres
const features = [
  {
    icon: '📝',
    title: 'Gestión de Requisiciones',
    description: 'Crea y envía solicitudes de compra de manera rápida y sencilla. Incluye todos los detalles necesarios para una aprobación eficiente.',
  },
  {
    icon: '✅',
    title: 'Aprobación en Tiempo Real',
    description: 'Los jefes de área pueden revisar y aprobar solicitudes directamente desde la plataforma, con notificaciones instantáneas.',
  },
  {
    icon: '📦',
    title: 'Seguimiento de Pedidos',
    description: 'Monitorea el estado de tus requisiciones en tiempo real, desde la solicitud hasta la entrega final.',
  },
  {
    icon: '📊',
    title: 'Reportes y Análisis',
    description: 'Genera informes detallados de compras, gastos por área y tiempos de aprobación para una mejor toma de decisiones.',
  },
  {
    icon: '🔒',
    title: 'Seguridad y Control',
    description: 'Acceso restringido según perfiles de usuario, con registro completo de todas las acciones realizadas en el sistema.',
  },
  {
    icon: '📱',
    title: 'Acceso Móvil',
    description: 'Gestiona y aprueba requisiciones desde cualquier lugar, en cualquier momento, directamente desde tu dispositivo móvil.',
  }
];

const HomeFeatures: React.FC<HomeFeaturesProps> = ({ onLoginClick }) => {
  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2>Funcionalidades Principales</h2>
          <p>Diseñado específicamente para empresas que necesitan un control eficiente de sus procesos de requisiciones.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFeatures;
