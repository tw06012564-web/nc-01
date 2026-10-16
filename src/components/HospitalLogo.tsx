import React from 'react';
import { HospitalConfig } from '../types/sticker';

interface HospitalLogoProps {
  config?: HospitalConfig;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded';
}

export const HospitalLogo: React.FC<HospitalLogoProps> = ({
  config,
  className = '',
  size = 'md',
  variant = 'rounded',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-xl',
    xl: 'w-16 h-16 text-3xl',
  };

  const roundedClasses = variant === 'circle' ? 'rounded-full' : 'rounded-xl';

  // If user uploaded a custom logo
  if (config?.logoType === 'custom' && config?.logoUrl) {
    return (
      <div
        className={`${sizeClasses[size]} ${roundedClasses} overflow-hidden bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-xs ${className}`}
      >
        <img
          src={config.logoUrl}
          alt={config.name || 'Hospital Logo'}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // If user selected Ministry of Public Health (สัญลักษณ์กระทรวงสาธารณสุข - คฑางู & บัวแก้ว)
  if (config?.logoType === 'moph') {
    return (
      <div
        className={`${sizeClasses[size]} ${roundedClasses} bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-amber-300 flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/40 p-0.5 ${className}`}
        title="ตราสัญลักษณ์กระทรวงสาธารณสุข"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Sunburst & Lotus Ring */}
          <circle cx="50" cy="50" r="46" stroke="#fbbf24" strokeWidth="3" fill="#065f46" />
          <circle cx="50" cy="50" r="41" stroke="#34d399" strokeWidth="1" strokeDasharray="2 3" />
          {/* Rod of Asclepius & Serpent (คฑากับงู) */}
          <path
            d="M50 14 V86"
            stroke="#fef08a"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="50" cy="14" r="5" fill="#facc15" />
          {/* Serpent winding around rod */}
          <path
            d="M36 28 C56 22, 64 36, 50 44 C36 52, 38 66, 50 72 C60 76, 56 82, 50 84"
            stroke="#fbbf24"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Radiant Wings / Leaves */}
          <path
            d="M32 36 C42 36, 48 30, 50 25 C52 30, 58 36, 68 36"
            stroke="#6ee7b7"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // Default Medical Cross (+)
  return (
    <div
      className={`${sizeClasses[size]} ${roundedClasses} bg-emerald-600 text-white flex items-center justify-center font-extrabold shrink-0 shadow-sm border border-emerald-400/30 select-none ${className}`}
    >
      <span>+</span>
    </div>
  );
};
