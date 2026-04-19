export function HeroScene() {
  return (
    <div className="hero-scene">
      <svg
        viewBox="0 0 1200 700"
        role="img"
        aria-label="Illustration of a financial protection city with signal paths and guarded institutions."
      >
        <defs>
          <linearGradient id="roadFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f2f6ff" />
            <stop offset="100%" stopColor="#e7eef7" />
          </linearGradient>
          <linearGradient id="mintGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b7f7e3" />
            <stop offset="100%" stopColor="#76ddb9" />
          </linearGradient>
        </defs>

        <path
          d="M88 494C88 453 122 420 163 420H402C440 420 471 389 471 351C471 310 504 277 545 277H744C790 277 828 239 828 193C828 153 860 121 900 121H1025C1067 121 1101 155 1101 197V490C1101 532 1067 566 1025 566H178C128 566 88 544 88 494Z"
          fill="url(#roadFill)"
          stroke="#d8dfeb"
          strokeWidth="10"
        />

        <g opacity="0.6">
          {[180, 280, 380, 480, 580, 680, 780, 880, 980].map((x) => (
            <line
              key={x}
              x1={x}
              y1="160"
              x2={x}
              y2="560"
              stroke="#dfe6f1"
              strokeWidth="2"
            />
          ))}
        </g>

        <g transform="translate(238 245)">
          <ellipse cx="150" cy="260" rx="170" ry="56" fill="#24344d" opacity="0.08" />
          <rect x="20" y="118" width="240" height="142" rx="28" fill="#ffffff" stroke="#c8d3e3" strokeWidth="6" />
          <rect x="20" y="165" width="240" height="36" fill="#24344d" />
          <rect x="42" y="140" width="48" height="18" rx="8" fill="#84e3c1" />
          <rect x="42" y="203" width="36" height="57" fill="#84e3c1" />
          <rect x="82" y="203" width="36" height="57" fill="#ecf3fb" />
          <rect x="122" y="203" width="36" height="57" fill="#84e3c1" />
          <rect x="162" y="203" width="36" height="57" fill="#ecf3fb" />
          <rect x="64" y="0" width="88" height="128" rx="32" fill="#ffffff" stroke="#c8d3e3" strokeWidth="6" />
          <rect x="82" y="18" width="52" height="110" rx="22" fill="url(#mintGlow)" opacity="0.75" />
          <ellipse cx="108" cy="16" rx="40" ry="16" fill="#dff8ef" stroke="#72829c" strokeWidth="4" />
        </g>

        <g transform="translate(488 304)">
          <ellipse cx="150" cy="230" rx="180" ry="50" fill="#24344d" opacity="0.08" />
          <path
            d="M0 192L118 116L272 166L272 230H0Z"
            fill="#ffffff"
            stroke="#c8d3e3"
            strokeWidth="6"
          />
          <path d="M18 180L118 128L252 170V200H18Z" fill="url(#mintGlow)" />
          <path d="M32 190V140M62 200V154M92 210V170M122 176V220M152 170V226M182 174V232M212 184V236" stroke="#24344d" strokeWidth="4" />
          <rect x="50" y="86" width="174" height="108" rx="18" fill="#ffffff" stroke="#c8d3e3" strokeWidth="6" />
          <path d="M62 150L140 108L212 138V178H62Z" fill="#7ee0bf" opacity="0.9" />
        </g>

        <g transform="translate(820 208)">
          <ellipse cx="130" cy="238" rx="160" ry="52" fill="#24344d" opacity="0.08" />
          <rect x="6" y="76" width="248" height="154" rx="42" fill="#ffffff" stroke="#c8d3e3" strokeWidth="6" />
          <path d="M26 154H236" stroke="#24344d" strokeWidth="6" />
          <path d="M40 154V230H126V154" fill="#b7f7e3" stroke="#24344d" strokeWidth="6" />
          <path d="M128 76H248V154H128C150 154 168 136 168 114C168 92 150 76 128 76Z" fill="url(#mintGlow)" opacity="0.75" />
          <path d="M6 76H128C106 76 88 94 88 116C88 138 106 156 128 156H6Z" fill="#eff5fb" />
          <rect x="90" y="16" width="106" height="68" rx="20" fill="#ffffff" stroke="#c8d3e3" strokeWidth="6" />
          <path d="M104 58H182M104 44H182M104 30H182" stroke="#24344d" strokeWidth="4" />
        </g>

        <g transform="translate(848 510)">
          <ellipse cx="76" cy="44" rx="82" ry="28" fill="#24344d" opacity="0.08" />
          <circle cx="76" cy="26" r="34" fill="#84e3c1" />
          <circle cx="76" cy="26" r="18" fill="#f5fbf8" stroke="#72829c" strokeWidth="4" />
          <path d="M76 -8A34 34 0 0 1 110 26" stroke="#6d6cff" strokeWidth="12" fill="none" strokeLinecap="round" />
        </g>

        <g fill="#b9e8d6">
          <circle cx="160" cy="340" r="8" />
          <circle cx="706" cy="176" r="8" />
          <circle cx="974" cy="470" r="8" />
          <circle cx="334" cy="598" r="8" />
          <circle cx="1126" cy="390" r="8" />
        </g>
      </svg>
    </div>
  );
}
