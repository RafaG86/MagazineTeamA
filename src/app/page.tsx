'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, CalendarDays, Plus, Heart, MessageSquare, X, Trophy, Edit3, Save, RefreshCw } from 'lucide-react';

const SECTIONS = [
  'Liga Betplay masculina',
  'Seleccion colombia',
  'Champions League',
  'Copa mundial 2026',
  'Charla tecnica',
  'Efemerides',
  'Formula 1',
  'Colombianos en el exterior'
];

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [edition, setEdition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [botLoading, setBotLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [authorized, setAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStandingsModal, setShowStandingsModal] = useState(false);
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ raw: '', processed: null });
  const [editMatches, setEditMatches] = useState<any[]>([]);
  
  const router = useRouter();
  
  // Form state for posts
  const [formData, setFormData] = useState({
    section: SECTIONS[0],
    title: '',
    content: ''
  });

  // State for editing standings
  const [editStandings, setEditStandings] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [postsRes, standingsRes, matchesRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/standings'),
        fetch('/api/matches')
      ]);
      
      const postsData = await postsRes.json();
      const standingsData = await standingsRes.json();
      const matchesData = await matchesRes.json();
      
      if (postsData.posts) {
        setPosts(postsData.posts);
        setEdition(postsData.edition);
      }
      
      if (standingsData.standings) {
        setStandings(standingsData.standings);
        setEditStandings(standingsData.standings);
      }

      if (matchesData.matches) {
        setMatches(matchesData.matches);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = () => {
    const hasAccess = localStorage.getItem('mag_access');
    const role = localStorage.getItem('user_role');
    if (!hasAccess) {
      router.push('/login');
      return false;
    }
    setAuthorized(true);
    setIsAdmin(role === 'admin');
    return true;
  };

  useEffect(() => {
    if (checkAccess()) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!showStandingsModal) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64 = reader.result as string;
              setBotLoading(true);
              try {
                const res = await fetch('/api/bot/vision', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ image: base64 })
                });
                const data = await res.json();
                if (data.standings) {
                  setEditStandings(data.standings);
                  alert('¡Imagen pegada procesada con éxito! ✨');
                }
              } catch (err) {
                alert('Error al procesar el pegado.');
              } finally {
                setBotLoading(false);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [showStandingsModal]);

  const handlePrint = () => {
    window.print();
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const username = localStorage.getItem('username');
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, username })
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ section: SECTIONS[0], title: '', content: '' });
        fetchData();
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleUpdateStandings = async () => {
    try {
      const username = localStorage.getItem('username');
      const res = await fetch('/api/standings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standings: editStandings, username })
      });
      if (res.ok) {
        alert('¡Tabla actualizada con éxito!');
        setShowStandingsModal(false);
        fetchData();
      } else {
        const data = await res.json();
        alert('Error al actualizar: ' + data.error);
      }
    } catch (err: any) {
      console.error('Error updating standings:', err);
      alert('Error de conexión: ' + err.message);
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    setBotLoading(true);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 400);
    return interval;
  };

  const handleBotStandings = async () => {
    setDebugInfo({ raw: 'El Bot está navegando en Google... por favor espera.', processed: 'La IA está esperando los datos del bot...' });
    setShowDebugModal(true);
    const interval = simulateProgress();
    try {
      const res = await fetch(`/api/bot/standings?v=${Date.now()}`);
      const data = await res.json();
      setDebugInfo({ 
        raw: data.debug_raw || 'No se capturó texto crudo.', 
        processed: data.standings || 'La IA no pudo procesar estos datos.' 
      });
      setProgress(100);
      fetchData();
    } catch (err) {
      setDebugInfo({ raw: 'Error de conexión.', processed: 'Error al contactar con el servidor.' });
    } finally {
      clearInterval(interval);
      setBotLoading(false);
      setProgress(0);
    }
  };

  const handleUclStandings = async () => {
    setDebugInfo({ raw: 'El Bot está consultando la tabla de Champions... espera.', processed: 'Sincronizando con AS.com...' });
    setShowDebugModal(true);
    const interval = simulateProgress();
    try {
      const res = await fetch(`/api/bot/ucl/standings?v=${Date.now()}`);
      const data = await res.json();
      setDebugInfo({ 
        raw: data.debug_raw || 'No se capturó texto.', 
        processed: data.standings || 'Procesado correctamente.' 
      });
      setProgress(100);
      fetchData();
    } catch (err) {
      setDebugInfo({ raw: 'Error de conexión.', processed: 'Error.' });
    } finally {
      clearInterval(interval);
      setBotLoading(false);
      setProgress(0);
    }
  };

  const handleBotResults = async () => {
    const interval = simulateProgress();
    try {
      const res = await fetch(`/api/bot/results?v=${Date.now()}`);
      const data = await res.json();
      if (data.matches) {
        setProgress(100);
        setTimeout(() => alert('¡IA: Resultados de Liga BetPlay actualizados!'), 200);
        fetchData();
      }
    } catch (err) {
      alert('Error al traer marcadores.');
    } finally {
      clearInterval(interval);
      setBotLoading(false);
      setProgress(0);
    }
  };

  const handleUclResults = async () => {
    const interval = simulateProgress();
    try {
      const res = await fetch(`/api/bot/ucl/results?v=${Date.now()}`);
      const data = await res.json();
      if (data.matches) {
        setProgress(100);
        setTimeout(() => alert('¡IA: Marcadores de Champions League actualizados!'), 200);
        fetchData();
      }
    } catch (err) {
      alert('Error al traer marcadores de UCL.');
    } finally {
      clearInterval(interval);
      setBotLoading(false);
      setProgress(0);
    }
  };

  const handleBotNews = async () => {
    const interval = simulateProgress();
    try {
      const res = await fetch(`/api/bot/news?v=${Date.now()}`);
      const data = await res.json();
      if (data.news && data.news.length > 0) {
        const first = data.news[0];
        setFormData({
          ...formData,
          title: first.title,
          content: first.content
        });
        setProgress(100);
        setTimeout(() => alert('¡IA Team A: Noticia redactada con inteligencia artificial!'), 200);
      }
    } catch (err) {
      alert('Error al buscar noticias con el Bot.');
    } finally {
      clearInterval(interval);
      setBotLoading(false);
      setProgress(0);
    }
  };

  const handleClipboardPaste = async () => {
    try {
      setBotLoading(true);
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(t => t.includes('image')) || 'image/png');
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            const res = await fetch('/api/bot/vision', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: base64 })
            });
            const data = await res.json();
            if (data.standings) {
              setEditStandings(data.standings);
              alert('¡Pantallazo procesado con éxito! ✨');
            }
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      alert('No se encontró ninguna imagen en el portapapeles. Prueba tomando un pantallazo primero.');
    } catch (err) {
      alert('Para usar esta función, debes permitir el acceso al portapapeles en tu navegador.');
    } finally {
      setBotLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBotLoading(true);
    setProgress(30);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/bot/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 })
        });
        const data = await res.json();
        if (data.standings) {
          setEditStandings(data.standings);
          alert('¡Tabla leída con éxito desde la imagen! ✨');
        } else {
          alert('No se pudo extraer la tabla de la imagen.');
        }
      } catch (err) {
        alert('Error al procesar la imagen.');
      } finally {
        setBotLoading(false);
        setProgress(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBotResults = async () => {
    const interval = simulateProgress();
    try {
      const res = await fetch(`/api/bot/results?v=${Date.now()}`);
      const data = await res.json();
      if (data.matches) {
        const username = localStorage.getItem('username');
        await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matches: data.matches, username })
        });
        setProgress(100);
        fetchData();
        setTimeout(() => alert('¡IA Team A: Marcadores de la fecha actualizados!'), 200);
      }
    } catch (err) {
      alert('Error al buscar resultados.');
    } finally {
      clearInterval(interval);
      setBotLoading(false);
      setProgress(0);
    }
  };

  if (!authorized || loading) {
    return null;
  }

  return (
    <main className="container">
      {botLoading && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <span className="progress-text">El Bot está navegando por la web... {progress}%</span>
        </div>
      )}
      <div className="hero">
        <h1>{edition?.name || 'Edición Semanal'}</h1>
        <p>Las noticias más importantes del deporte mundial, recopiladas en tiempo real.</p>
      </div>

      <div className="action-bar">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <CalendarDays size={20} />
            Muro Actualizable
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={18} />
            Imprimir PDF
          </button>
          {isAdmin && (
            <button className="btn" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              Nuevo Artículo
            </button>
          )}
        </div>
      </div>

      <section className="table-container">
        <div className="table-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} color="var(--primary)" />
            Tabla de Posiciones - Liga BetPlay
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isAdmin && (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleBotStandings}>
                <RefreshCw size={14} style={{ marginRight: '4px' }} />
                IA Tabla
              </button>
            )}
            {isAdmin && (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => {
                setEditStandings(standings.filter(s => s.division === 'A' || s.division === 'DIMAYOR' || !s.division));
                setShowStandingsModal(true);
              }}>
                <Edit3 size={14} style={{ marginRight: '4px' }} />
                Editar
              </button>
            )}
          </div>
        </div>
        <table className="league-table">
          <thead>
            <tr>
              <th>POS</th>
              <th>EQUIPO</th>
              <th>PJ</th>
              <th>GD</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.filter(s => s.division === 'A' || s.division === 'DIMAYOR' || !s.division).map((item) => (
              <tr key={item.id || item.team}>
                <td>
                  <span className={`pos-badge ${item.pos <= 8 ? 'pos-top' : ''}`}>
                    {item.pos}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{item.team}</td>
                <td>{item.pj}</td>
                <td>{item.gd}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="table-container" style={{ marginTop: '2rem' }}>
        <div className="table-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} color="#3b82f6" />
            UEFA Champions League - Fase de Liga
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isAdmin && (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleUclStandings}>
                <RefreshCw size={14} style={{ marginRight: '4px' }} />
                IA Champions
              </button>
            )}
          </div>
        </div>
        <table className="league-table">
          <thead>
            <tr>
              <th>POS</th>
              <th>EQUIPO</th>
              <th>PJ</th>
              <th>GD</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.filter(s => s.division === 'UCL_LEAGUE').map((item) => (
              <tr key={item.id || item.team}>
                <td>
                  <span className={`pos-badge ${item.pos <= 8 ? 'pos-top' : item.pos <= 24 ? 'pos-mid' : ''}`} style={{ backgroundColor: item.pos <= 8 ? '#10b981' : item.pos <= 24 ? '#3b82f6' : '' }}>
                    {item.pos}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{item.team}</td>
                <td>{item.pj}</td>
                <td>{item.gd}</td>
                <td style={{ fontWeight: 700, color: '#3b82f6' }}>{item.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {standings.filter(s => s.division === 'UCL_LEAGUE').length === 0 && (
          <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>Pulsa "IA Champions" para traer la tabla actualizada.</p>
        )}
      </section>

      <section className="matches-section" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={20} />
            Liga BetPlay - Resultados
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isAdmin && (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleBotResults}>
                <RefreshCw size={14} style={{ marginRight: '4px' }} />
                IA Marcadores
              </button>
            )}
            {isAdmin && (
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setEditMatches(matches.filter(m => m.tournament !== 'Champions League'));
                  setShowMatchesModal(true);
                }}
              >
                <Edit3 size={14} style={{ marginRight: '4px' }} />
                Editar
              </button>
            )}
          </div>
        </div>
        <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {matches.filter(m => m.tournament !== 'Champions League').map((m, idx) => (
            <div key={idx} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{m.home_team}</span>
                <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, color: 'var(--primary)' }}>{m.home_score}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{m.away_team}</span>
                <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, color: 'var(--primary)' }}>{m.away_score}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="matches-section" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={20} />
            Champions League - Marcadores
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isAdmin && (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleUclResults}>
                <RefreshCw size={14} style={{ marginRight: '4px' }} />
                IA UCL Marcadores
              </button>
            )}
          </div>
        </div>
        <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {matches.filter(m => m.tournament === 'Champions League').map((m, idx) => (
            <div key={idx} className="card" style={{ padding: '1rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                {m.round}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{m.home_team}</span>
                <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, color: '#3b82f6' }}>{m.home_score}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{m.away_team}</span>
                <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, color: '#3b82f6' }}>{m.away_score}</span>
              </div>
            </div>
          ))}
          {matches.filter(m => m.tournament === 'Champions League').length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', gridColumn: '1/-1' }}>Pulsa "IA UCL Marcadores" para traer la última fecha.</p>
          )}
        </div>
      </section>

      <div className="masonry-grid">
        {posts.length === 0 ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Aún no hay publicaciones en esta edición. ¡Sé el primero en escribir!
          </p>
        ) : (
          posts.map((post: any) => (
            <article key={post.id} className="card">
              <div className="card-content">
                <span className="card-tag">{post.section}</span>
                <h2 className="card-title">{post.title}</h2>
                <p className="card-text">{post.content}</p>
              </div>
              <div className="card-footer">
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                    <Heart size={16} /> 0
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                    <MessageSquare size={16} /> 0
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal for New Post */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Redactar Nuevo Artículo</h3>
              <button onClick={() => setShowModal(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmitPost}>
              <div className="form-group">
                <label>Sección</label>
                <select 
                  value={formData.section}
                  onChange={e => setFormData({...formData, section: e.target.value})}
                >
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Título</label>
                <input 
                  type="text" 
                  required
                  placeholder="Titular impactante..."
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Contenido</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Escribe el cuerpo de la noticia..."
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn">Publicar</button>
                <button type="button" className="btn btn-secondary" onClick={handleBotNews}>
                  Sugerir con IA ✨
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleBotResults}>
                  Traer Marcadores IA ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Standings */}
      {showStandingsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', overflowY: 'auto', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h3>Editar Tabla de Posiciones</h3>
              <button onClick={() => setShowStandingsModal(false)} className="close-btn"><X size={24} /></button>
            </div>
            <div className="table-editor">
              <table className="league-table">
                <thead>
                  <tr>
                    <th>POS</th>
                    <th>EQUIPO</th>
                    <th>PJ</th>
                    <th>GD</th>
                    <th>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {editStandings.map((s, idx) => (
                    <tr key={idx}>
                      <td>{s.pos}</td>
                      <td>
                        <input 
                          type="text" 
                          value={s.team} 
                          onChange={e => {
                            const newS = [...editStandings];
                            newS[idx].team = e.target.value;
                            setEditStandings(newS);
                          }}
                          style={{ width: '100%', background: 'transparent', border: 'none', color: 'white' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={s.pj} 
                          onChange={e => {
                            const newS = [...editStandings];
                            newS[idx].pj = parseInt(e.target.value);
                            setEditStandings(newS);
                          }}
                          style={{ width: '50px', background: 'transparent', border: 'none', color: 'white' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={s.gd} 
                          onChange={e => {
                            const newS = [...editStandings];
                            newS[idx].gd = parseInt(e.target.value);
                            setEditStandings(newS);
                          }}
                          style={{ width: '50px', background: 'transparent', border: 'none', color: 'white' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={s.pts} 
                          onChange={e => {
                            const newS = [...editStandings];
                            newS[idx].pts = parseInt(e.target.value);
                            setEditStandings(newS);
                          }}
                          style={{ width: '50px', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn" onClick={handleUpdateStandings}>
                <Save size={18} />
                Guardar Cambios
              </button>
              <button className="btn btn-secondary" onClick={handleBotStandings}>
                Actualizar con IA ✨
              </button>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                  id="image-upload" 
                />
                <button 
                  className="btn btn-secondary" 
                  onClick={() => document.getElementById('image-upload')?.click()}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Subir Imagen
                </button>
                
                <button 
                  className="btn btn-secondary" 
                  onClick={handleClipboardPaste}
                  style={{ background: '#10b981', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Save size={14} /> Pegar Captura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: var(--secondary);
          width: 90%;
          max-width: 600px;
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid var(--border);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: white;
          font-family: inherit;
        }
        .table-editor input {
          border-bottom: 1px solid var(--border) !important;
          border-radius: 0;
          padding: 0.2rem;
        }
        .table-editor input:focus {
          border-bottom: 1px solid var(--primary) !important;
          outline: none;
        }
      `}</style>
      {/* Debug Modal */}
      {showDebugModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="modal-header">
              <h3>Inspección del Proceso IA ✨</h3>
              <button onClick={() => setShowDebugModal(false)} className="close-btn"><X size={24} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxHeight: '60vh', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>1. LO QUE EL BOT VIO (Google Search)</h4>
                <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', fontSize: '0.75rem', overflowY: 'auto', flex: 1, border: '1px solid #333' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', color: '#0f0' }}>{debugInfo.raw}</pre>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ color: '#fbbf24', fontSize: '0.9rem' }}>2. LO QUE LA IA INTERPRETÓ</h4>
                <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', fontSize: '0.75rem', overflowY: 'auto', flex: 1, border: '1px solid #333' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', color: '#60a5fa' }}>
                    {typeof debugInfo.processed === 'string' 
                      ? debugInfo.processed 
                      : JSON.stringify(debugInfo.processed, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowDebugModal(false)}>Cancelar</button>
              <button 
                className="btn" 
                disabled={typeof debugInfo.processed === 'string'}
                onClick={() => {
                setEditStandings(debugInfo.processed);
                setShowDebugModal(false);
                setShowStandingsModal(true);
              }}>
                Confirmar y Aplicar a la Tabla
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Gestión de Partidos */}
      {showMatchesModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Gestionar Resultados de la Jornada</h3>
              <button onClick={() => setShowMatchesModal(false)} className="close-btn"><X size={24} /></button>
            </div>
            <div className="table-editor" style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.5rem' }}>Local</th>
                    <th style={{ padding: '0.5rem' }}>Score</th>
                    <th style={{ padding: '0.5rem' }}>Visitante</th>
                    <th style={{ padding: '0.5rem' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {editMatches.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '0.5rem' }}>
                        <input value={m.home_team} onChange={(e) => {
                          const newM = [...editMatches];
                          newM[idx].home_team = e.target.value;
                          setEditMatches(newM);
                        }} />
                      </td>
                      <td style={{ padding: '0.5rem', display: 'flex', gap: '4px' }}>
                        <input type="number" style={{ width: '50px' }} value={m.home_score} onChange={(e) => {
                          const newM = [...editMatches];
                          newM[idx].home_score = parseInt(e.target.value);
                          setEditMatches(newM);
                        }} />
                        -
                        <input type="number" style={{ width: '50px' }} value={m.away_score} onChange={(e) => {
                          const newM = [...editMatches];
                          newM[idx].away_score = parseInt(e.target.value);
                          setEditMatches(newM);
                        }} />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <input value={m.away_team} onChange={(e) => {
                          const newM = [...editMatches];
                          newM[idx].away_team = e.target.value;
                          setEditMatches(newM);
                        }} />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <button className="close-btn" onClick={() => {
                          setEditMatches(editMatches.filter((_, i) => i !== idx));
                        }}><X size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }} onClick={addMatchRow}>
                + Agregar Partido
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowMatchesModal(false)}>Cancelar</button>
              <button className="btn" onClick={saveMatches}>Guardar Resultados</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
