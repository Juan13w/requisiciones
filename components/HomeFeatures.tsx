import React from 'react';
import Image from 'next/image';
import './HomeFeatures.css';
import { cn } from '@/lib/utils'; // Asegúrate de que esta ruta sea correcta

interface HomeFeaturesProps {
  onLoginClick?: () => void;
}

const features = [
  {
    image: '/images/imagenes/img4.png',
    title: 'Gestión de Requisiciones',
    description: 'Crea y envía solicitudes de compra de manera rápida y sencilla. Incluye todos los detalles necesarios para una aprobación eficiente.',
  },
  {
    image: '/images/imagenes/img5.png',
    title: 'Aprobación en Tiempo Real',
    description: 'Los jefes de área pueden revisar y aprobar solicitudes directamente desde la plataforma, con notificaciones instantáneas.',
  },
  {
    image: '/images/imagenes/img6.png',
    title: 'Seguimiento de Pedidos',
    description: 'Monitorea el estado de tus requisiciones en tiempo real, desde la solicitud hasta la entrega final.',
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
              <div className="feature-image-container">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="feature-image"
                />
              </div>
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
