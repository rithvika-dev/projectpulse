import React, { useState } from 'react';

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
  status,
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-16 h-16 text-lg',
  };

  // Deterministic subtle pastel background based on name
  const getBackgroundColor = (str) => {
    const colors = [
      'bg-forest-100 text-forest-800 border-forest-200',
      'bg-terracotta-100 text-terracotta-800 border-terracotta-200',
      'bg-amberGold-100 text-amberGold-800 border-amberGold-200',
      'bg-slate-100 text-slate-800 border-slate-200',
      'bg-sand-200 text-charcoal-800 border-sand-300',
    ];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const statusColors = {
    online: 'bg-emerald-500 ring-white',
    busy: 'bg-terracotta-500 ring-white',
    offline: 'bg-sand-400 ring-white',
  };

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className={`rounded-full object-cover border border-sand-200 shadow-subtle ${sizes[size]}`}
        />
      ) : (
        <div
          className={`rounded-full flex items-center justify-center font-semibold border shadow-subtle ${sizes[size]} ${getBackgroundColor(
            name
          )}`}
          title={name}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ${
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
          } ${statusColors[status] || statusColors.online}`}
        />
      )}
    </div>
  );
};
