import React from "react";

interface DreamscapeLogoProps {
  className?: string;
}

export default function DreamscapeLogo({ className = "w-11 h-11" }: DreamscapeLogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Clip path to keep all internal graphics perfectly round inside the inner circle */}
        <clipPath id="logo-circle-clip">
          <circle cx="100" cy="100" r="62" />
        </clipPath>

        {/* Path for text ARCHED at the top: DREAMSCAPE */}
        <path
          id="top-text-path"
          d="M 22,100 A 78,78 0 0,1 178,100"
          fill="none"
        />

        {/* Path for text ARCHED at the bottom: TRAVEL & TOURS */}
        <path
          id="bottom-text-path"
          d="M 178,100 A 78,78 0 0,1 22,100"
          fill="none"
        />
      </defs>

      {/* Styled Inner Circle with Clip Path */}
      <g clipPath="url(#logo-circle-clip)">
        {/* Solid Rich Brand Orange Background */}
        <circle cx="100" cy="100" r="62" fill="#F97316" />

        {/* Crescent Moon */}
        <path
          d="M 68,54 A 14,14 0 1,0 85,82 A 11,11 0 1,1 68,54 Z"
          fill="#111C2D"
        />

        {/* Airplane */}
        <g transform="translate(126, 68) rotate(-22)">
          <path
            d="M -12,-1 L 5,-1 Q 9,-1 11,0 Q 9,1 5,1 L -12,1 Q -13,0 -12,-1 Z"
            fill="#111C2D"
          />
          {/* Main wing */}
          <path
            d="M -2,-1 L -5,-8 L -2,-8 L 3,-1 Z"
            fill="#111C2D"
          />
          <path
            d="M -4,1 L -7,7 L -4,7 L 1,1 Z"
            fill="#111C2D"
          />
          {/* Tail */}
          <path
            d="M -10,-1 L -11.5,-4 L -9.5,-4 L -8,-1 Z"
            fill="#111C2D"
          />
        </g>

        {/* Wavy Terrain base line - Dark silhouette */}
        <path
          d="M 35,116 C 72,110 102,126 165,116 L 165,165 L 35,165 Z"
          fill="#111C2D"
        />

        {/* Palm Tree */}
        <g>
          {/* Trunk */}
          <path
            d="M 130,120 C 132,108 126,98 131,81"
            stroke="#111C2D"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Fronds */}
          <path d="M 131,81 Q 115,83 111,89 C 114,83 131,81 131,81" fill="#111C2D" stroke="#111C2D" strokeWidth="0.5" />
          <path d="M 131,81 Q 113,73 117,70 C 113,73 131,81 131,81" fill="#111C2D" stroke="#111C2D" strokeWidth="0.5" />
          <path d="M 131,81 Q 126,65 131,61 C 127,65 131,81 131,81" fill="#111C2D" stroke="#111C2D" strokeWidth="0.5" />
          <path d="M 131,81 Q 144,66 146,70 C 144,66 131,81 131,81" fill="#111C2D" stroke="#111C2D" strokeWidth="0.5" />
          <path d="M 131,81 Q 149,77 149,83 C 148,77 131,81 131,81" fill="#111C2D" stroke="#111C2D" strokeWidth="0.5" />
          <path d="M 131,81 Q 142,91 140,96 C 141,91 131,81 131,81" fill="#111C2D" stroke="#111C2D" strokeWidth="0.5" />
        </g>

        {/* Wavy Sky Blue and Dark Blue Water Stripes */}
        {/* Layer 1: Dark Blue Wave */}
        <path
          d="M 32,126 Q 65,115 100,128 T 168,125 L 168,165 L 32,165 Z"
          fill="#1D4ED8"
        />
        {/* Layer 2: Medium/Vibrant Blue Wave */}
        <path
          d="M 32,133 Q 66,123 101,135 T 168,132 L 168,165 L 32,165 Z"
          fill="#0284C7"
        />
        {/* Layer 3: Sky Blue Wave */}
        <path
          d="M 32,141 Q 67,131 102,143 T 168,140 L 168,165 L 32,165 Z"
          fill="#38BDF8"
        />
      </g>

      {/* Circle Stroke Boundary (representing the thin frame line) */}
      <circle
        cx="100"
        cy="100"
        r="62"
        stroke="#111C2D"
        strokeWidth="3.5"
        fill="none"
      />

      {/* Arched Text: DREAMSCAPE (Top) */}
      <text
        fontFamily='"Outfit", "Inter", sans-serif'
        fontSize="17.5px"
        fontWeight="bold"
        fill="#111C2D"
        letterSpacing="1px"
      >
        <textPath href="#top-text-path" startOffset="50%" textAnchor="middle">
          DREAMSCAPE
        </textPath>
      </text>

      {/* Arched Text: TRAVEL & TOURS (Bottom) */}
      <text
        fontFamily='"Outfit", "Inter", sans-serif'
        fontSize="11.5px"
        fontWeight="bold"
        fill="#111C2D"
        letterSpacing="2px"
      >
        <textPath href="#bottom-text-path" startOffset="50%" textAnchor="middle">
          TRAVEL & TOURS
        </textPath>
      </text>
    </svg>
  );
}
