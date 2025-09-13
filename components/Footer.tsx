'use client';

import React from 'react';
import './Footer.css';

export const Footer = () => {
  // Array con los números de los logos que existen
  const logoNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  // Función para obtener la ruta correcta de la imagen
  const getImagePath = (number: number) => {
    // Aseguramos que el número tenga el formato correcto (1-15)
    const paddedNumber = number < 10 ? `0${number}` : `${number}`;
    return `/images/imagenes/Logo${number}.png`;
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logos">
          {logoNumbers.map((number) => (
            <img
              key={number}
              src={getImagePath(number)}
              alt={`Logo ${number}`}
              className="footer-logo"
              onError={(e) => {
                // Si hay un error al cargar la imagen, la ocultamos
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                console.warn(`No se pudo cargar la imagen: ${getImagePath(number)}`);
              }}
              onLoad={(e) => {
                // Si la imagen se carga correctamente, la mostramos
                const target = e.target as HTMLImageElement;
                target.style.display = 'block';
              }}
            />
          ))}
        </div>
        <div className="footer-text">
          <p>© {new Date().getFullYear()} Gestión de Turnos. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};