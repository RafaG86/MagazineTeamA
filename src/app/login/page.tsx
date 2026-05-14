'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('mag_access', 'true');
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('username', data.username);
        router.push('/');
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.logoWrapper}>
          <Shield size={40} color="white" />
        </div>
        
        <h2 className={styles.title}>Magazine Team A</h2>
        <p className={styles.subtitle}>Panel de Control Administrativo</p>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nombre de Usuario</label>
            <div className={styles.inputWrapper}>
              <User className={styles.icon} size={20} />
              <input 
                className={styles.input}
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.icon} size={20} />
              <input 
                className={styles.input}
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          ¿Problemas de acceso? <a href="#">Contacta soporte</a>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
