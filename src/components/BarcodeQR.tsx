import React from 'react';

interface BarcodeProps {
  code: string;
  className?: string;
  height?: number;
  showText?: boolean;
}

export const Barcode: React.FC<BarcodeProps> = ({
  code,
  className = '',
  height = 20,
  showText = false
}) => {
  // Generate deterministic bar widths from input string
  const hash = code.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000, 7);
  
  // Standard pattern of 36 bars with varying widths
  const bars = Array.from({ length: 36 }).map((_, i) => {
    const val = (hash * (i + 13) + i * 17) % 7;
    return val === 0 ? 1 : val % 3 + 1;
  });

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 100 24"
        style={{ height: `${height}px`, width: '100%', maxWidth: '120px' }}
        preserveAspectRatio="none"
        className="overflow-hidden"
      >
        <rect width="100" height="24" fill="white" />
        {bars.map((w, idx) => {
          if (idx % 2 === 0) {
            const x = (idx / 36) * 100;
            const barWidth = (w / 36) * 100 * 0.8;
            return (
              <rect
                key={idx}
                x={x}
                y="1"
                width={barWidth}
                height="22"
                fill="#000000"
              />
            );
          }
          return null;
        })}
      </svg>
      {showText && (
        <span className="text-[8px] font-mono tracking-wider text-slate-600 mt-0.5">
          *{code}*
        </span>
      )}
    </div>
  );
};
