interface CinedleLogoProps {
  size?: number;
  className?: string;
  idPrefix?: string;
}

export function CinedleLogo({
  size = 28,
  className = "",
  idPrefix = "cndl",
}: CinedleLogoProps) {
  const bgId = `${idPrefix}-bg`;
  const rimId = `${idPrefix}-rim`;
  const greenId = `${idPrefix}-green`;
  const goldId = `${idPrefix}-gold`;
  const purpleId = `${idPrefix}-purple`;
  const roseId = `${idPrefix}-rose`;
  const shadowId = `${idPrefix}-shadow`;
  const glowId = `${idPrefix}-glow`;
  const squircleClipId = `${idPrefix}-squircle-clip`;
  const topClipId = `${idPrefix}-top-clip`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#161522" />
          <stop offset="50%" stopColor="#0C0B14" />
          <stop offset="100%" stopColor="#050408" />
        </linearGradient>

        <linearGradient id={rimId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5C518" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#22C55E" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id={greenId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>

        <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="60%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        <linearGradient id={purpleId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        <linearGradient id={roseId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="14"
            stdDeviation="14"
            floodColor="#000000"
            floodOpacity="0.7"
          />
        </filter>

        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="36" result="blur" />
        </filter>

        <clipPath id={squircleClipId}>
          <rect x="0" y="0" width="512" height="512" rx="128" />
        </clipPath>

        <clipPath id={topClipId}>
          <rect x="0" y="0" width="300" height="64" rx="20" />
        </clipPath>
      </defs>

      {/* EVERYTHING clipped inside squircle to prevent any bleed */}
      <g clipPath={`url(#${squircleClipId})`}>
        <rect width="512" height="512" fill={`url(#${bgId})`} />

        {/* Ambient Glows */}
        <circle
          cx="200"
          cy="240"
          r="140"
          fill="#22C55E"
          opacity="0.22"
          filter={`url(#${glowId})`}
        />
        <circle
          cx="320"
          cy="270"
          r="140"
          fill="#F5C518"
          opacity="0.22"
          filter={`url(#${glowId})`}
        />

        {/* CLAPPERBOARD & 2x2 CINE TILES */}
        <g transform="translate(106 92)" filter={`url(#${shadowId})`}>
          {/* Top Clapper Bar */}
          <g transform="translate(150 36) rotate(-8) translate(-150 -36)">
            <g clipPath={`url(#${topClipId})`}>
              <rect x="0" y="0" width="300" height="64" fill="#12131C" />
              <g fill="#F5C518">
                <polygon points="36,0 72,0 36,64 0,64" />
                <polygon points="108,0 144,0 108,64 72,64" />
                <polygon points="180,0 216,0 180,64 144,64" />
                <polygon points="252,0 288,0 252,64 216,64" />
                <polygon points="324,0 360,0 324,64 288,64" />
              </g>
            </g>
            <rect
              x="0"
              y="0"
              width="300"
              height="64"
              rx="20"
              fill="none"
              stroke="#F5C518"
              strokeWidth="4"
              strokeOpacity="0.8"
            />
            <circle
              cx="26"
              cy="32"
              r="9"
              fill="#18181B"
              stroke="#FFFFFF"
              strokeWidth="3"
            />
          </g>

          {/* Lower Clapper Body */}
          <rect
            x="0"
            y="72"
            width="300"
            height="254"
            rx="28"
            fill="#13141E"
            stroke="#252636"
            strokeWidth="5"
          />

          {/* Film Sprocket holes */}
          <g fill="#F5C518" opacity="0.9">
            <rect x="14" y="98" width="12" height="18" rx="4" />
            <rect x="14" y="138" width="12" height="18" rx="4" />
            <rect x="14" y="178" width="12" height="18" rx="4" />
            <rect x="14" y="218" width="12" height="18" rx="4" />
            <rect x="14" y="258" width="12" height="18" rx="4" />
            <rect x="14" y="298" width="12" height="18" rx="4" />
          </g>

          {/* 2x2 Big Puzzle Tiles */}
          <g transform="translate(44 88)">
            {/* C */}
            <g transform="translate(0 0)">
              <rect width="114" height="106" rx="18" fill={`url(#${greenId})`} />
              <rect
                width="114"
                height="106"
                rx="18"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeOpacity="0.4"
              />
              <text
                x="57"
                y="74"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="68"
                fontWeight="900"
                fill="#FFFFFF"
                textAnchor="middle"
              >
                C
              </text>
            </g>

            {/* I */}
            <g transform="translate(128 0)">
              <rect width="114" height="106" rx="18" fill={`url(#${goldId})`} />
              <rect
                width="114"
                height="106"
                rx="18"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeOpacity="0.4"
              />
              <text
                x="57"
                y="74"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="68"
                fontWeight="900"
                fill="#0A0A0F"
                textAnchor="middle"
              >
                I
              </text>
            </g>

            {/* N */}
            <g transform="translate(0 120)">
              <rect width="114" height="106" rx="18" fill={`url(#${purpleId})`} />
              <rect
                width="114"
                height="106"
                rx="18"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeOpacity="0.4"
              />
              <text
                x="57"
                y="74"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="68"
                fontWeight="900"
                fill="#FFFFFF"
                textAnchor="middle"
              >
                N
              </text>
            </g>

            {/* E */}
            <g transform="translate(128 120)">
              <rect width="114" height="106" rx="18" fill={`url(#${roseId})`} />
              <rect
                width="114"
                height="106"
                rx="18"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeOpacity="0.4"
              />
              <text
                x="57"
                y="74"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="68"
                fontWeight="900"
                fill="#FFFFFF"
                textAnchor="middle"
              >
                E
              </text>
            </g>
          </g>
        </g>

        {/* Top-Right Cinema Star Sparkle */}
        <g transform="translate(426 84)">
          <path
            d="M0 -34 Q0 0 34 0 Q0 0 0 34 Q0 0 -34 0 Q0 0 0 -34 Z"
            fill="#FDE047"
          />
          <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
        </g>

        {/* Outer Rim Stroke */}
        <rect
          x="4"
          y="4"
          width="504"
          height="504"
          rx="124"
          fill="none"
          stroke={`url(#${rimId})`}
          strokeWidth="8"
        />
      </g>
    </svg>
  );
}