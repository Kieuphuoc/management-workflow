import React from 'react';

export function ClientLogo({ client = '', className = 'w-9 h-9' }: { client?: string; className?: string }) {
  const norm = client.toLowerCase();

  if (norm.includes('unilever')) {
    return (
      <div className={`${className} rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 p-1 overflow-hidden`} title={client}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Logo-Unilever.webp" alt="Unilever" className="w-full h-full object-contain" />
      </div>
    );
  }

  if (norm.includes('samsung')) {
    const isSmall = className.includes('w-6') || className.includes('h-6');
    const badgeSize = isSmall ? 'h-6 w-[44px] px-1 py-0.5' : 'h-8 w-[58px] px-1.5 py-0.5';

    return (
      <div className={`${badgeSize} rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden`} title={client}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-samsung-ai.png" alt="Samsung" className="w-full h-full object-contain" />
      </div>
    );
  }

  if (norm.includes('shopee')) {
    return (
      <div className={`${className} rounded-lg bg-orange-50/50 border border-orange-100/80 shadow-2xs flex items-center justify-center shrink-0 p-1 overflow-hidden`} title={client}>
        <svg viewBox="0 0 64 64" className="w-full h-full object-contain" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#EE4D2D"/>
          <path d="M22 22V18C22 12.5 26.5 8 32 8C37.5 8 42 12.5 42 18V22H47C48.1 22 49 22.9 49 24L46.5 50C46.3 52.2 44.5 54 42.3 54H21.7C19.5 54 17.7 52.2 17.5 50L15 24C15 22.9 15.9 22 17 22H22ZM26 22H38V18C38 14.7 35.3 12 32 12C28.7 12 26 14.7 26 18V22Z" fill="#ffffff"/>
          <path d="M35.5 32C35.5 29.8 33.7 28.5 31.5 28.5C29 28.5 27.5 29.8 27.5 31.8C27.5 35.5 36.5 34.5 36.5 40.5C36.5 43.8 33.8 45.5 31 45.5C27.8 45.5 26 43.5 26 41.2H29C29 42.2 30 43 31.2 43C32.8 43 33.8 42 33.8 40.5C33.8 37 25 36 25 31.5C25 28 27.8 26 31.5 26C34.8 26 37 28 37 31.2H35.5V32Z" fill="#EE4D2D"/>
        </svg>
      </div>
    );
  }

  if (norm.includes('nestle') || norm.includes('nestlé')) {
    return (
      <div className={`${className} rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 p-1 overflow-hidden`} title={client}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-nestle.webp" alt="Nestlé" className="w-full h-full object-contain" />
      </div>
    );
  }

  // Fallback monogram
  const initials = client.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'CL';
  return (
    <div className={`${className} rounded-lg bg-blue-600 text-white font-black text-xs shadow-2xs flex items-center justify-center shrink-0 tracking-wider`} title={client}>
      {initials}
    </div>
  );
}

export function BrandLogo({ brand = '', className = 'w-9 h-9' }: { brand?: string; className?: string }) {
  const norm = brand.toLowerCase();

  if (norm.includes('close up') || norm.includes('closeup')) {
    const isSmall = className.includes('w-6') || className.includes('h-6');
    const badgeSize = isSmall ? 'h-6 w-[38px] px-1 py-0.5' : 'h-8 w-[52px] px-1.5 py-0.5';

    return (
      <div className={`${badgeSize} rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden`} title={brand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Close_Up_logo.webp" alt="Close Up" className="w-full h-full object-contain" />
      </div>
    );
  }

  if (norm.includes('samsung') || norm.includes('galaxy') || norm.includes('display') || norm.includes('ai')) {
    const isSmall = className.includes('w-6') || className.includes('h-6');
    const badgeSize = isSmall ? 'h-6 w-[44px] px-1 py-0.5' : 'h-8 w-[58px] px-1.5 py-0.5';

    return (
      <div className={`${badgeSize} rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden`} title={brand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-samsung-ai.png" alt="Samsung AI" className="w-full h-full object-contain" />
      </div>
    );
  }

  if (norm.includes('nestle') || norm.includes('nestlé')) {
    return (
      <div className={`${className} rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 p-1 overflow-hidden`} title={brand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-nestle.webp" alt="Nestlé" className="w-full h-full object-contain" />
      </div>
    );
  }

  if (norm.includes('omo')) {
    return (
      <div className={`${className} rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 p-1 overflow-hidden`} title={brand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-omo-matic.png" alt="OMO Matic" className="w-full h-full object-contain" />
      </div>
    );
  }

  if (norm.includes('lifebuoy')) {
    const isSmall = className.includes('w-6') || className.includes('h-6');
    const badgeSize = isSmall ? 'h-6 w-[38px] px-0.5 py-0.5' : 'h-8 w-[52px] px-1 py-0.5';

    return (
      <div className={`${badgeSize} rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden`} title={brand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-lifebuoy.jpg" alt="Lifebuoy" className="w-full h-full object-contain" />
      </div>
    );
  }

  if (norm.includes('milo')) {
    const isSmall = className.includes('w-6') || className.includes('h-6');
    const badgeSize = isSmall ? 'h-6 w-[40px] px-1 py-0.5' : 'h-8 w-[54px] px-1.5 py-0.5';

    return (
      <div className={`${badgeSize} rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden`} title={brand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-milo.svg" alt="Milo" className="w-full h-full object-contain" />
      </div>
    );
  }

  if (norm.includes('shopee')) {
    return (
      <div className={`${className} rounded-lg bg-red-50/50 border border-red-100/80 shadow-2xs flex items-center justify-center shrink-0 p-1 overflow-hidden`} title={brand}>
        <svg viewBox="0 0 64 64" className="w-full h-full object-contain" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#B91C1C"/>
          <text x="32" y="30" fontFamily="'Noto Sans', Arial, sans-serif" fontWeight="900" fontSize="11" fill="#ffffff" textAnchor="middle">Shopee</text>
          <rect x="15" y="36" width="34" height="14" rx="3" fill="#ffffff"/>
          <text x="32" y="47" fontFamily="'Noto Sans', Arial, sans-serif" fontWeight="900" fontSize="10" fill="#B91C1C" textAnchor="middle">MALL</text>
        </svg>
      </div>
    );
  }

  // Fallback monogram
  const initials = brand.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'BR';
  return (
    <div className={`${className} rounded-lg bg-teal-600 text-white font-black text-xs shadow-2xs flex items-center justify-center shrink-0 tracking-wider`} title={brand}>
      {initials}
    </div>
  );
}
