"use client";

import { useEffect } from 'react';

export default function StyleLoader() {
  useEffect(() => {
    // Forzar una recarga de estilos cuando el componente se monte
    if (typeof window !== 'undefined') {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          const newHref = href.split('?')[0] + '?v=' + new Date().getTime();
          link.setAttribute('href', newHref);
        }
      });
    }
  }, []);

  return null;
}
