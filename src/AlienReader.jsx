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
        {/* Alien Body Group */}
        <g className="alien-body-group">
          {/* Antenna */}
          <line x1="80" y1="38" x2="80" y2="20" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="80" cy="16" r="5" stroke="#2563eb" strokeWidth="2.5" className="alien-antenna-tip" />

          {/* Head - Contorno Lineal */}
          <path
            d="M 52 56 C 52 38, 108 38, 108 56 C 108 76, 52 76, 52 56 Z"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Left Eye */}
          <ellipse cx="66" cy="56" rx="5" ry="7" stroke="#2563eb" strokeWidth="2.5" fill="none" />
          <circle cx="67" cy="55" r="1.5" fill="#2563eb" />

          {/* Right Eye */}
          <ellipse cx="94" cy="56" rx="5" ry="7" stroke="#2563eb" strokeWidth="2.5" fill="none" />
          <circle cx="95" cy="55" r="1.5" fill="#2563eb" />

          {/* Smile */}
          <path d="M 75 66 Q 80 70 85 66" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Arms holding the book */}
          <path d="M 62 75 C 62 86, 98 86, 98 75" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 64 80 L 52 95" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 96 80 L 108 95" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Book / Files Component */}
        <g className="alien-book-group" transform="translate(0, 10)">
          {/* Left Page Base */}
          <path
            d="M 80 115 Q 60 110, 38 116 L 38 92 Q 60 86, 80 92 Z"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Page Base */}
          <path
            d="M 80 115 Q 100 110, 122 116 L 122 92 Q 100 86, 80 92 Z"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Spine */}
          <line x1="80" y1="92" x2="80" y2="115" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

          {/* Book Text Lines - Left */}
          <line x1="46" y1="98" x2="72" y2="96" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="46" y1="104" x2="70" y2="102" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="46" y1="110" x2="66" y2="108" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" />

          {/* Flipping Page 1 */}
          <path
            d="M 80 115 Q 98 108, 115 112 L 115 88 Q 98 84, 80 92 Z"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="alien-flipping-page page-1"
          />

          {/* Flipping Page 2 */}
          <path
            d="M 80 115 Q 95 106, 110 108 L 110 84 Q 95 82, 80 92 Z"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="alien-flipping-page page-2"
          />
        </g>

        {/* Sparkles / Data Particles */}
        <circle cx="35" cy="45" r="2" fill="#60a5fa" className="alien-sparkle s1" />
        <circle cx="125" cy="40" r="1.5" fill="#60a5fa" className="alien-sparkle s2" />
        <circle cx="28" cy="80" r="1.8" fill="#60a5fa" className="alien-sparkle s3" />
        <circle cx="132" cy="85" r="2" fill="#60a5fa" className="alien-sparkle s4" />
      </svg>
    </div>
  );
}
