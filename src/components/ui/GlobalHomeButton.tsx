'use client';

import { Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function GlobalHomeButton() {
  const pathname = usePathname();
  
  // 仅在非首页显示
  if (pathname === '/') {
    return null;
  }

  const handleClick = () => {
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-6 left-6 z-50 p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 group shadow-lg"
      style={{
        backgroundColor: 'var(--card-glass)',
        border: '1px solid var(--card-border)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
      title="返回首页"
    >
      <Home 
        className="w-5 h-5 transition-colors duration-200" 
        style={{ 
          color: 'var(--text-secondary)' 
        }}
      />
      <style jsx>{`
        button:hover {
          background-color: var(--card-hover, rgba(255,255,255,0.9)) !important;
          border-color: var(--flow-primary, #0ea5e9) !important;
          transform: scale(1.1);
        }
        button:hover .group {
          color: var(--flow-primary, #0ea5e9) !important;
        }
      `}</style>
    </button>
  );
}