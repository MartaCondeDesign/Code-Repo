import React from "react";

export default function AlienReader() {
  return (
    <div className="alien-loader-wrapper">
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="alien-reader-svg"
        aria-hidden="true"
      >
        {/* Contorno Puro de Extraterrestre (Sin expresiones ni detalles faciales) */}
        <g className="alien-body-group">
          {/* Antena */}
          <line x1="80" y1="36" x2="80" y2="18" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="80" cy="14" r="5" stroke="#2563eb" strokeWidth="2.5" fill="none" className="alien-antenna-tip" />

          {/* Silueta / Contorno de Cabeza */}
          <path
            d="M 52 54 C 52 34, 108 34, 108 54 C 108 76, 52 76, 52 54 Z"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Contorno de Torso y Brazos sosteniendo el libro */}
          <path
            d="M 64 74 C 64 88, 96 88, 96 74"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M 64 78 L 50 94" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 96 78 L 110 94" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Contornos de Libro / Páginas en movimiento */}
        <g className="alien-book-group" transform="translate(0, 10)">
          {/* Contorno Página Base Izquierda */}
          <path
            d="M 80 116 Q 60 110, 36 116 L 36 90 Q 60 84, 80 90 Z"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Contorno Página Base Derecha */}
          <path
            d="M 80 116 Q 100 110, 124 116 L 124 90 Q 100 84, 80 90 Z"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Lomo del Libro */}
          <line x1="80" y1="90" x2="80" y2="116" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

          {/* Contorno Página 1 abriéndose */}
          <path
            d="M 80 116 Q 98 108, 116 112 L 116 86 Q 98 82, 80 90 Z"
            stroke="#2563eb"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="alien-flipping-page page-1"
          />

          {/* Contorno Página 2 abriéndose */}
          <path
            d="M 80 116 Q 96 104, 110 106 L 110 80 Q 96 78, 80 90 Z"
            stroke="#2563eb"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="alien-flipping-page page-2"
          />
        </g>
      </svg>
    </div>
  );
}
