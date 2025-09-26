'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Importar estilos globales
import '@/styles/globals.css';
import '@/styles/ComprasDashboard.css';
import '@/styles/RequisitionDetails.css';
import '@/styles/charts.css';

export default function StyleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Forzar recarga de estilos cuando cambia la ruta
  useEffect(() => {
    // Esta función se ejecutará cuando el componente se monte
    // y cuando cambie la ruta (pathname)
    const loadStyles = () => {
      // Verificar si estamos en el navegador
      if (typeof window !== 'undefined') {
        // Forzar recarga de estilos dinámicamente
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href) {
            const newHref = href.split('?')[0] + '?t=' + new Date().getTime();
            link.setAttribute('href', newHref);
          }
        });
      }
    };

    loadStyles();
  }, [pathname]);

  return <>{children}</>;
}
