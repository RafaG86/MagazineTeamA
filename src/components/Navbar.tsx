'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Home, Shield } from 'lucide-react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar si hay sesión activa
    const access = localStorage.getItem('mag_access');
    setIsLoggedIn(!!access);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('mag_access');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <header className="header">
      <div className="brand">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
        Team A para Encasa Radio
      </div>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <a href="/" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <Home size={16} /> Muro
        </a>
        
        {isLoggedIn ? (
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        ) : (
          <a href="/login" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <Shield size={16} /> Acceso
          </a>
        )}
      </nav>
    </header>
  );
}
