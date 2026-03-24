import React from 'react';

export default function AdBanner({ slot = 'top', className = '' }) {
  const isTop = slot === 'top';
  const height = isTop ? 'h-20' : 'h-24';

  return (
    <div
      className={`ad-banner ${height} ${className}`}
      data-ad-slot={slot}
      aria-label="Advertisement"
    >
      <span className="select-none opacity-40 text-xs uppercase tracking-widest">
        Advertisement
      </span>
    </div>
  );
}
