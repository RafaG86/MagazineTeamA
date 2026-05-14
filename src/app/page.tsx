'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, CalendarDays, Plus, Heart, MessageSquare, X, Trophy, Edit3, Save, RefreshCw, Bold, Italic, Underline, List, ListOrdered, Quote, Heading2, Heading3, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const SECTIONS = [
  'Liga Betplay masculina',
  'Seleccion colombia',
  'Champions League',
  'Copa mundial 2026',
  'Charla tecnica',
  'Efemerides',
  'Formula 1',
  'Colombianos en el exterior',
  'Personalizada'
];

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [edition, setEdition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [botLoading, setBotLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [authorized, setAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStandingsModal, setShowStandingsModal] = useState(false);
  const [showStandings, setShowStandings] = useState(false);
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ raw: '', processed: null });
  const [editMatches, setEditMatches] = useState<any[]>([]);
  
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Form state for posts
  const [formData, setFormData] = useState({
    section: SECTIONS[0],
    customSection: '',
    title: '',
    content: ''
  });

  const [matchFormData, setMatchFormData] = useState<any>({
    tournament: 'Liga BetPlay',
    home_team: '',
    away_team: '',
    home_score: 0,
    away_score: 0,
    status: 'scheduled',
    round: '',
    comments: ''
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
      const method = editingPost ? 'PUT' : 'POST';
      const url = editingPost ? `/api/posts/${editingPost.id}` : '/api/posts';
      
      // Sync content from the rich text editor
      const editorContent = editorRef.current?.innerHTML || formData.content;
      if (!editorContent || editorContent === '<br>' || editorContent.trim() === '') {
        alert('El contenido del artículo no puede estar vacío.');
        return;
      }

      const sectionToSave = formData.section === 'Personalizada' ? formData.customSection : formData.section;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: formData.title,
          content: editorContent,
          section: sectionToSave,
          author: username 
        })
      });
      
      if (res.ok) {
        setShowModal(false);
        setEditingPost(null);
        setFormData({ section: SECTIONS[0], customSection: '', title: '', content: '' });
        fetchData();
      }
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    const isCustom = !SECTIONS.slice(0, -1).includes(post.section);
    setFormData({ 
      section: isCustom ? 'Personalizada' : post.section, 
      customSection: isCustom ? post.section : '',
      title: post.title, 
      content: post.content 
    });
    setShowModal(true);
  };

  const handleSubmitMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingMatch ? 'PUT' : 'POST';
      const url = editingMatch ? `/api/matches/${editingMatch.id}` : '/api/matches';

      // Sanitize: don't send empty strings as null will be handled by backend
      const payload = {
        ...matchFormData,
        source: matchFormData.source || 'manual',
        match_time: matchFormData.match_time?.trim() || null,
        match_date: matchFormData.match_date?.trim() || null,
      };
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowMatchesModal(false);
        setEditingMatch(null);
        fetchData();
      } else {
        const err = await res.json();
        alert('Error al guardar: ' + (err.message || res.statusText));
      }
    } catch (err) {
      console.error('Error saving match:', err);
      alert('Error de conexión al guardar el partido.');
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
    alert('Sincronización de resultados IA deshabilitada por solicitud editorial.');
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
          <button className="btn btn-secondary" onClick={() => setShowStandings(!showStandings)}>
            <Trophy size={18} style={{ marginRight: '6px' }} />
            {showStandings ? 'Ocultar Tablas' : 'Ver Tablas de Posiciones'}
          </button>
          {isAdmin && (
            <>
              <button className="btn btn-secondary" onClick={() => { setEditingMatch(null); setMatchFormData({ tournament: 'Liga BetPlay', home_team: '', away_team: '', home_score: 0, away_score: 0, status: 'scheduled', round: '', comments: '', source: 'manual', match_date: new Date().toISOString().split('T')[0], match_time: '' }); setShowMatchesModal(true); }}>
                <Trophy size={18} style={{ marginRight: '6px' }} />
                Nuevo Partido
              </button>
              <button className="btn" onClick={() => { setEditingPost(null); setFormData({ section: SECTIONS[0], title: '', content: '' }); setShowModal(true); }}>
                <Plus size={18} style={{ marginRight: '6px' }} />
                Nuevo Artículo
              </button>
            </>
          )}
        </div>
      </div>
      {showStandings && (
        <>
          <section className="table-container" style={{ marginBottom: '3rem' }}>
            <div className="table-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={20} color="var(--primary)" />
                Tabla de Posiciones - Liga BetPlay
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isAdmin && (
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleBotStandings}>
                    <RefreshCw size={14} style={{ marginRight: '4px' }} />
                    Sincronizar IA
                  </button>
                )}
                {isAdmin && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => {
                      setEditStandings(standings.filter(s => s.division === 'DIMAYOR'));
                      setShowStandingsModal(true);
                    }}
                  >
                    <Edit3 size={14} style={{ marginRight: '4px' }} />
                    Editar
                  </button>
                )}
              </div>
            </div>
            <div className="table-wrapper">
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
                  {standings.filter(s => s.division === 'DIMAYOR' || s.division === 'A' || !s.division).map((item) => (
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
            </div>
          </section>

          <section className="table-container" style={{ marginBottom: '3rem' }}>
            <div className="table-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
                <Trophy size={20} />
                UEFA Champions League
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
            <div className="table-wrapper">
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
            </div>
          </section>
        </>
      )}


      {/* Partidos Manuales (Programación y Reportes) */}
      <section className="matches-section" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CalendarDays size={28} color="var(--accent)" />
            Agenda y Reportes de Partidos
          </h2>
        </div>

        <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {matches.filter(m => m.source !== 'ia').length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay reportes de partidos manuales.</p>
          ) : (
            matches.filter(m => m.source !== 'ia').map((m) => (
              <div key={m.id} className="match-card manual-match" style={{ borderLeft: '4px solid var(--accent)' }}>
                {/* Status badge + date/time */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: m.status === 'finished' ? 'rgba(16,185,129,0.15)' : m.status === 'live' ? 'rgba(239,68,68,0.15)' : 'rgba(100,116,139,0.2)',
                    color: m.status === 'finished' ? '#10b981' : m.status === 'live' ? '#ef4444' : '#94a3b8',
                    letterSpacing: '0.05em'
                  }}>
                    {m.status === 'finished' ? '✓ Finalizado' : m.status === 'live' ? '● En Vivo' : '⌚ Programado'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {m.match_date ? new Date(m.match_date + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    {m.match_time ? ` • ${m.match_time}` : ''}
                  </span>
                </div>
                
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  {m.tournament} • {m.round}
                </div>

                <div className="match-teams" style={{ padding: '0.5rem 0' }}>
                  <div className="team-row">
                    <span className="team-name" style={{ fontSize: '1.1rem' }}>{m.home_team}</span>
                    <span className="team-score" style={{ background: 'var(--accent)', color: '#000' }}>{m.home_score}</span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', margin: '-4px 0' }}>VS</div>
                  <div className="team-row">
                    <span className="team-name" style={{ fontSize: '1.1rem' }}>{m.away_team}</span>
                    <span className="team-score" style={{ background: 'var(--accent)', color: '#000' }}>{m.away_score}</span>
                  </div>
                </div>

                {m.comments && (
                  <div className="match-meta" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div className="match-commentary" style={{ margin: 0, color: 'var(--text-light)' }}>{m.comments}</div>
                  </div>
                )}

                {isAdmin && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '0.75rem', 
                    marginTop: '1.25rem', 
                    borderTop: '1px solid rgba(255,255,255,0.08)', 
                    paddingTop: '1rem' 
                  }}>
                    <button 
                      onClick={() => { setEditingMatch(m); setMatchFormData({...m}); setShowMatchesModal(true); }}
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; }}
                    >
                      <Edit3 size={14} /> Editar
                    </button>
                    <button 
                      onClick={async () => { if(confirm('¿Eliminar reporte?')) { await fetch(`/api/matches/${m.id}`, {method:'DELETE'}); fetchData(); } }}
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    >
                      <X size={14} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))
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
              <div className="card-header">
                <div className="author-info">
                  <div className="author-avatar">
                    {post.author ? post.author[0].toUpperCase() : 'U'}
                  </div>
                  <div className="author-details">
                    <span className="author-name">{post.author || 'Usuario Team A'}</span>
                    <span className="post-time">
                      {new Date(post.created_at).toLocaleDateString()} • {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <span className="card-tag" style={{ margin: 0, fontSize: '0.65rem' }}>{post.section}</span>
              </div>

              <div className="card-content" style={{ paddingTop: '0.5rem' }}>
                <h2 className="card-title" style={{ fontSize: '1.4rem', fontWeight: '800' }}>{post.title}</h2>
                <div className="card-text rich-content" dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              <div className="card-footer">
                <div className="card-actions">
                  <button className="action-item" style={{ background: 'none', border: 'none' }}>
                    <Heart size={18} />
                    <span>{post.likes_count || 0}</span>
                  </button>
                  <button 
                    className="action-item" 
                    style={{ background: 'none', border: 'none' }}
                    onClick={() => {
                      const newShow = { ...showComments };
                      newShow[post.id] = !newShow[post.id];
                      setShowComments(newShow);
                    }}
                  >
                    <MessageSquare size={18} />
                    <span>{post.comments_count || 0}</span>
                  </button>
                  
                  {isAdmin && (
                    <>
                      <button 
                        className="action-item" 
                        style={{ background: 'none', border: 'none' }}
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        className="action-item" 
                        style={{ background: 'none', border: 'none', color: 'var(--danger)' }}
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <X size={18} />
                      </button>
                    </>
                  )}
                </div>
                <div className="action-item">
                  <Printer size={16} />
                </div>
              </div>

              {showComments[post.id] && (
                <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment: any) => (
                        <div key={comment.id} style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{comment.author}: </span>
                          <span style={{ color: 'var(--foreground)' }}>{comment.content}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No hay comentarios aún.</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Escribe un comentario..." 
                      style={{ 
                        flexGrow: 1, 
                        background: 'var(--background)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px', 
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        color: 'white'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          // Lógica para enviar comentario
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {/* Modal for New Post */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingPost ? 'Editar Artículo' : 'Redactar Nuevo Artículo'}</h3>
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
              {formData.section === 'Personalizada' && (
                <div className="form-group">
                  <label>Nombre de la Sección Personalizada</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ejem: Futbol Sala, Tenis, etc."
                    value={formData.customSection}
                    onChange={e => setFormData({...formData, customSection: e.target.value})}
                  />
                </div>
              )}
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
                <div className="rte-toolbar">
                  <button type="button" title="Negrita" onMouseDown={e => { e.preventDefault(); document.execCommand('bold'); }}><Bold size={16} /></button>
                  <button type="button" title="Cursiva" onMouseDown={e => { e.preventDefault(); document.execCommand('italic'); }}><Italic size={16} /></button>
                  <button type="button" title="Subrayado" onMouseDown={e => { e.preventDefault(); document.execCommand('underline'); }}><Underline size={16} /></button>
                  <span className="rte-sep" />
                  <button type="button" title="Título H2" onMouseDown={e => { e.preventDefault(); document.execCommand('formatBlock', false, 'H2'); }}><Heading2 size={16} /></button>
                  <button type="button" title="Subtítulo H3" onMouseDown={e => { e.preventDefault(); document.execCommand('formatBlock', false, 'H3'); }}><Heading3 size={16} /></button>
                  <span className="rte-sep" />
                  <button type="button" title="Lista" onMouseDown={e => { e.preventDefault(); document.execCommand('insertUnorderedList'); }}><List size={16} /></button>
                  <button type="button" title="Lista Numerada" onMouseDown={e => { e.preventDefault(); document.execCommand('insertOrderedList'); }}><ListOrdered size={16} /></button>
                  <button type="button" title="Cita" onMouseDown={e => { e.preventDefault(); document.execCommand('formatBlock', false, 'BLOCKQUOTE'); }}><Quote size={16} /></button>
                  <span className="rte-sep" />
                  <button type="button" title="Alinear Izquierda" onMouseDown={e => { e.preventDefault(); document.execCommand('justifyLeft'); }}><AlignLeft size={16} /></button>
                  <button type="button" title="Centrar" onMouseDown={e => { e.preventDefault(); document.execCommand('justifyCenter'); }}><AlignCenter size={16} /></button>
                  <button type="button" title="Alinear Derecha" onMouseDown={e => { e.preventDefault(); document.execCommand('justifyRight'); }}><AlignRight size={16} /></button>
                  <span className="rte-sep" />
                  <button type="button" title="Enlace" onMouseDown={e => { 
                    e.preventDefault(); 
                    const url = prompt('Ingresa la URL del enlace:');
                    if (url) document.execCommand('createLink', false, url);
                  }}><LinkIcon size={16} /></button>
                </div>
                <div 
                  ref={editorRef}
                  className="rte-editor"
                  contentEditable 
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                  onBlur={() => {
                    if (editorRef.current) {
                      setFormData(prev => ({ ...prev, content: editorRef.current!.innerHTML }));
                    }
                  }}
                  data-placeholder="Escribe el cuerpo de la noticia..."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn">{editingPost ? 'Actualizar' : 'Publicar'}</button>
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
          /* Responsive Design Pro */
          @media (max-width: 768px) {
            .header {
              padding: 1rem;
              flex-direction: column;
              gap: 1rem;
              height: auto;
            }

            .brand h1 {
              font-size: 1.25rem;
            }

            .nav {
              width: 100%;
              justify-content: center;
              gap: 0.75rem;
            }

            .hero {
              padding: 3rem 1.5rem;
              text-align: center;
            }

            .hero h1 {
              font-size: 2.25rem;
            }

            .action-bar {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;
            }

            .masonry-grid {
              grid-template-columns: 1fr;
            }

            .matches-grid {
              grid-template-columns: 1fr !important;
            }

            .modal-content {
              width: 95% !important;
              padding: 1.5rem;
              margin: 1rem;
            }

            .card-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.75rem;
            }

            .card-tag {
              align-self: flex-start;
            }
          }

          @media (max-width: 480px) {
            .hero h1 {
              font-size: 1.75rem;
            }

            .brand .badge {
              display: none;
            }

            .nav-link span {
              display: none;
            }

            .action-item span {
              font-size: 0.75rem;
            }
          }
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
      {/* Modal for Matches */}
      {showMatchesModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editingMatch ? 'Editar Partido' : 'Registrar Nuevo Partido'}</h3>
              <button onClick={() => setShowMatchesModal(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmitMatch}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Torneo</label>
                  <input type="text" value={matchFormData.tournament} onChange={e => setMatchFormData({...matchFormData, tournament: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Jornada/Ronda</label>
                  <input type="text" value={matchFormData.round} onChange={e => setMatchFormData({...matchFormData, round: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Equipo Local</label>
                  <input type="text" value={matchFormData.home_team} onChange={e => setMatchFormData({...matchFormData, home_team: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Equipo Visitante</label>
                  <input type="text" value={matchFormData.away_team} onChange={e => setMatchFormData({...matchFormData, away_team: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Goles Local</label>
                  <input type="number" value={matchFormData.home_score} onChange={e => setMatchFormData({...matchFormData, home_score: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Goles Visitante</label>
                  <input type="number" value={matchFormData.away_score} onChange={e => setMatchFormData({...matchFormData, away_score: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" value={matchFormData.match_date} onChange={e => setMatchFormData({...matchFormData, match_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input type="time" value={matchFormData.match_time} onChange={e => setMatchFormData({...matchFormData, match_time: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={matchFormData.status} onChange={e => setMatchFormData({...matchFormData, status: e.target.value})}>
                    <option value="scheduled">Programado</option>
                    <option value="live">En Vivo</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Comentarios / Reporte del partido</label>
                <textarea 
                  rows={3} 
                  value={matchFormData.comments} 
                  onChange={e => setMatchFormData({...matchFormData, comments: e.target.value})}
                  placeholder="Ej: Gol de Luis Díaz al minuto 45..."
                ></textarea>
              </div>
              <button type="submit" className="btn" style={{ width: '100%', marginTop: '1.5rem' }}>
                {editingMatch ? 'Guardar Cambios' : 'Registrar Partido'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
