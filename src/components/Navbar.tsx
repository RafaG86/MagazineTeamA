'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Home, Shield, Trophy } from 'lucide-react';

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
      <div className="brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <Trophy size={20} color="white" />
          </div>
          <span style={{ 
            fontSize: '1.4rem', 
            fontWeight: '900', 
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to right, #ffffff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Outfit, sans-serif'
          }}>
            TEAM <span style={{ color: 'var(--primary)' }}>A</span>
          </span>
        </div>
        <span style={{ 
          fontSize: '0.6rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.2em', 
          color: 'var(--text-muted)',
          marginLeft: '34px',
          marginTop: '-2px',
          fontWeight: '600'
        }}>
          Sports Media Group
        </span>
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
