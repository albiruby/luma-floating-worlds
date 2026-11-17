import React from 'react';

export const LumaTitleEmblem: React.FC = () => (
  <svg
    viewBox="0 0 360 112"
    className="w-[290px] sm:w-[345px] h-auto select-none"
    role="img"
    aria-label="LUMA: Floating Worlds"
  >
    {/* Outer Horizon Crest */}
    <g transform="translate(46, 54)">
      <polygon
        points="0,-38 22,-8 0,34 -22,-8"
        fill="#22d3c5"
        stroke="#1b2a34"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <polygon points="0,-38 22,-8 0,2" fill="#7cf9eb" opacity="0.85" />
      <polygon points="0,-38 -22,-8 0,2" fill="#3be4d3" opacity="0.9" />
      <polygon points="0,2 22,-8 0,34" fill="#159a92" />
      <ellipse
        cx="0"
        cy="0"
        rx="32"
        ry="11"
        fill="none"
        stroke="#ebb652"
        strokeWidth="2.5"
        transform="rotate(-18)"
      />
      <circle cx="29" cy="-9" r="3.5" fill="#ffe79e" stroke="#1b2a34" strokeWidth="1.5" />
    </g>

    {/* Wordmark */}
    <text
      x="104"
      y="62"
      className="font-display"
      fontSize="48"
      fontWeight="700"
      letterSpacing="8"
      fill="#fbf5e6"
      stroke="#1c2a33"
      strokeWidth="6"
      paintOrder="stroke fill"
    >
      LUMA
    </text>
    <line x1="106" y1="74" x2="338" y2="74" stroke="#ebb652" strokeWidth="2" strokeLinecap="round" />
    <text
      x="106"
      y="95"
      fontSize="13.5"
      fontWeight="700"
      letterSpacing="4.5"
      fill="#1b2b34"
    >
      FLOATING WORLDS
    </text>
  </svg>
);

export const CrystalIcon: React.FC<{ active: boolean; className?: string }> = ({
  active,
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <polygon
      points="12,2 19,10 12,22 5,10"
      fill={active ? '#34ebd8' : '#31434d'}
      stroke="#18252d"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <polygon
      points="12,2 19,10 12,12"
      fill={active ? '#9afff4' : '#4a606c'}
    />
    <polygon
      points="12,12 19,10 12,22"
      fill={active ? '#15a69b' : '#23323b'}
    />
  </svg>
);

export const EchoIcon: React.FC<{ collected: boolean; className?: string }> = ({
  collected,
  className = 'w-4 h-4',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <polygon
      points="12,2 18,9 12,22 6,9"
      fill={collected ? '#d977f2' : '#4b5563'}
      stroke="#18252d"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <polygon
      points="12,2 18,9 12,11.5"
      fill={collected ? '#f7c4ff' : '#6b7280'}
    />
    <circle
      cx="12"
      cy="10"
      r="9"
      fill="none"
      stroke={collected ? '#ebb652' : '#6b7280'}
      strokeWidth="1.5"
      strokeDasharray="3 2"
    />
  </svg>
);

export const ShardIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <polygon
      points="12,2 20,10 16,21 8,21 4,10"
      fill="#ffd166"
      stroke="#1f2d38"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <polygon points="12,2 20,10 12,12" fill="#fff0b3" />
    <polygon points="12,12 16,21 8,21" fill="#e09b2d" />
  </svg>
);

export const HeroBadgeIcon: React.FC<{ color?: string; className?: string }> = ({
  color = '#e39b2b',
  className = 'w-4 h-4',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="7.5" r="4" fill="#f5ecd7" stroke="#1f2d38" strokeWidth="1.8" />
    <path
      d="M5 20.5c.8-4.5 3.6-7 7-7s6.2 2.5 7 7z"
      fill={color}
      stroke="#1f2d38"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

export const TrophyIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M7 4h10v6a5 5 0 0 1-10 0V4z"
      fill="#ebb652"
      stroke="#1f2d38"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M7 6H4.5a1.5 1.5 0 0 0 0 3H7m10-3h2.5a1.5 1.5 0 0 1 0 3H17" fill="none" stroke="#1f2d38" strokeWidth="1.8" />
    <path d="M12 15v4m-4 2h8" stroke="#1f2d38" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const SoundIcon: React.FC<{ muted: boolean }> = ({ muted }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M4 9.5h4l5-4.5v14l-5-4.5H4z"
      fill="#f5ecd7"
      stroke="#1a262e"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {muted ? (
      <path d="M16.5 9.5l4 5m0-5l-4 5" stroke="#e87461" strokeWidth="2.2" strokeLinecap="round" />
    ) : (
      <>
        <path d="M16.2 8.8a4.5 4.5 0 0 1 0 6.4" fill="none" stroke="#53f0de" strokeWidth="2" strokeLinecap="round" />
        <path d="M18.8 6.5a8 8 0 0 1 0 11" fill="none" stroke="#ebb652" strokeWidth="2" strokeLinecap="round" />
      </>
    )}
  </svg>
);

export const RestartIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M4.5 11a7.5 7.5 0 1 1 2.2 5.3"
      fill="none"
      stroke="#f5ecd7"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <polygon points="4,6 9.5,6.5 5,11.5" fill="#ebb652" stroke="#1a262e" strokeWidth="1" />
  </svg>
);

export const PauseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <rect x="6" y="5" width="4.2" height="14" rx="1" fill="#f5ecd7" stroke="#1a262e" strokeWidth="1.5" />
    <rect x="13.8" y="5" width="4.2" height="14" rx="1" fill="#f5ecd7" stroke="#1a262e" strokeWidth="1.5" />
  </svg>
);

export const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({
  filled,
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <polygon
      points="12,2.2 14.9,8.3 21.6,9.2 16.7,13.9 17.9,20.5 12,17.3 6.1,20.5 7.3,13.9 2.4,9.2 9.1,8.3"
      fill={filled ? '#ebb652' : '#d5c9ad'}
      stroke="#1f2d38"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {filled && (
      <polygon
        points="12,3.8 14.3,8.6 12,12.2 9.7,8.6"
        fill="#ffe394"
        opacity="0.85"
      />
    )}
  </svg>
);

export const WardrobeIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 3l4.5 3.5 3.5 12-8 2.5-8-2.5 3.5-12z"
      fill="#ebb652"
      stroke="#1f2d38"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M12 3v18" stroke="#1f2d38" strokeWidth="1.5" />
    <circle cx="12" cy="8.5" r="2" fill="#24c9b8" stroke="#1f2d38" strokeWidth="1.3" />
  </svg>
);

export const RecordsIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <rect x="4" y="13" width="4" height="7" rx="0.8" fill="#24c9b8" stroke="#1f2d38" strokeWidth="1.6" />
    <rect x="10" y="8" width="4" height="12" rx="0.8" fill="#ebb652" stroke="#1f2d38" strokeWidth="1.6" />
    <rect x="16" y="4" width="4" height="16" rx="0.8" fill="#f5ecd7" stroke="#1f2d38" strokeWidth="1.6" />
  </svg>
);
