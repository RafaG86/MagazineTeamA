@extends('layouts.app')

@section('content')
<div id="view-mode">
    <div class="action-bar">
        <h2 style="font-family: 'Outfit'; font-weight: 900;">Edición Actual: <span id="current-date">{{ date('d/m/Y') }}</span></h2>
        <div style="display: flex; gap: 0.5rem;">
            <button class="btn" onclick="openModal('news')">
                <i data-lucide="plus-circle"></i> Nueva Noticia
            </button>
        </div>
    </div>

<div class="table-container">
    <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h3><i data-lucide="trophy"></i> Tabla de Posiciones - Liga BetPlay</h3>
        <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" onclick="runBot('standings')">
                <i data-lucide="refresh-cw"></i> IA Tabla
            </button>
            <button class="btn btn-secondary" onclick="openStandingsModal()">Editar Manual</button>
        </div>
    </div>
    <table class="league-table">
        <thead>
            <tr>
                <th>Pos</th>
                <th>Club</th>
                <th>PJ</th>
                <th>G</th>
                <th>E</th>
                <th>P</th>
                <th>GF</th>
                <th>GC</th>
                <th>DG</th>
                <th>Pts</th>
                <th>Últimos 5</th>
            </tr>
        </thead>
        <tbody id="standings-body-a">
        </tbody>
    </table>
</div>

<div class="table-container" style="margin-top: 2rem;">
    <div class="table-header">
        <h3><i data-lucide="award"></i> Tabla de Posiciones - Torneo BetPlay</h3>
    </div>
    <table class="league-table">
        <thead>
            <tr>
                <th>Pos</th>
                <th>Club</th>
                <th>PJ</th>
                <th>G</th>
                <th>E</th>
                <th>P</th>
                <th>GF</th>
                <th>GC</th>
                <th>DG</th>
                <th>Pts</th>
                <th>Últimos 5</th>
            </tr>
        </thead>
        <tbody id="standings-body-b">
        </tbody>
    </table>
</div>

<div class="table-container" style="margin-top: 2rem;">
    <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h3><i data-lucide="trophy"></i> UEFA Champions League - Fase de Liga</h3>
        <button class="btn btn-secondary" onclick="runBot('ucl-standings')">
            <i data-lucide="refresh-cw"></i> IA Champions
        </button>
    </div>
    <div style="overflow-x: auto;">
        <table class="league-table">
            <thead>
                <tr>
                    <th>Pos</th>
                    <th>Club</th>
                    <th>PJ</th>
                    <th>G</th>
                    <th>E</th>
                    <th>P</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th>DG</th>
                    <th>Pts</th>
                    <th>Últimos 5</th>
                </tr>
            </thead>
            <tbody id="standings-body-ucl">
            </tbody>
        </table>
    </div>
</div>

<div class="table-container" id="matches-container" style="margin-top: 2rem;">
    <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 1rem;">
            <h3><i data-lucide="calendar"></i> Partidos - Liga BetPlay 2026</h3>
            <span id="matches-round" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;"></span>
        </div>
        <button class="btn btn-secondary" onclick="runBot('results')">
            <i data-lucide="zap"></i> IA Marcadores
        </button>
    </div>
    <div id="matches-grid" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
        <p style="color: var(--text-muted); text-align: center; padding: 2rem;">Pulsa “IA Marcadores” para cargar los partidos.</p>
    </div>
</div>

<div class="table-container" id="ucl-matches-container" style="margin-top: 2rem;">
    <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 1rem;">
            <h3><i data-lucide="calendar"></i> Partidos - UEFA Champions League</h3>
            <span id="ucl-matches-round" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;"></span>
        </div>
        <button class="btn btn-secondary" onclick="runBot('ucl-results')">
            <i data-lucide="zap"></i> IA UCL Marcadores
        </button>
    </div>
    <div id="ucl-matches-grid" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
        <p style="color: var(--text-muted); text-align: center; padding: 2rem;">Pulsa “IA UCL Marcadores” para cargar los partidos de la Champions.</p>
    </div>
</div>

    <div class="masonry-grid" id="news-grid">
        <!-- News will be loaded here via JS -->
    </div>
</div><!-- End View Mode -->

<!-- Edit Mode Panel -->
<div id="edit-mode" style="display: none; padding-top: 2rem;">
    <div class="table-container">
        <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h3 style="color: var(--primary);"><i data-lucide="edit-3"></i> Panel de Edición de Tablas</h3>
                <p style="font-size: 0.9rem; color: var(--text-muted);">Gestiona Liga A y B simultáneamente</p>
            </div>
            <button class="btn btn-secondary" onclick="toggleMode('view')">
                <i data-lucide="arrow-left"></i> Regresar
            </button>
        </div>
        
        <div class="table-editor" style="overflow-x: auto; margin-top: 1rem;">
            <table class="league-table" style="width: 100%; min-width: 1000px;">
                <thead>
                    <tr>
                        <th style="width: 40px;">DIV</th>
                        <th style="width: 40px;">POS</th>
                        <th>LOGO URL</th>
                        <th style="width: 150px;">EQUIPO</th>
                        <th style="width: 50px;">PJ</th>
                        <th style="width: 50px;">G</th>
                        <th style="width: 50px;">E</th>
                        <th style="width: 50px;">P</th>
                        <th style="width: 50px;">GF</th>
                        <th style="width: 50px;">GC</th>
                        <th style="width: 50px;">DG</th>
                        <th style="width: 50px;">PTS</th>
                        <th style="width: 100px;">FORMA</th>
                    </tr>
                </thead>
                <tbody id="edit-standings-body">
                </tbody>
            </table>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn" onclick="addTeam()">
                    <i data-lucide="plus"></i> Fila
                </button>
                <button class="btn btn-secondary" onclick="loadColombianTeams('A')" style="background: #fbbf24; color: black; border: none;">
                    <i data-lucide="list"></i> Equipos Liga A
                </button>
                <button class="btn btn-secondary" onclick="loadColombianTeams('B')" style="background: #60a5fa; color: white; border: none;">
                    <i data-lucide="list"></i> Equipos Liga B
                </button>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn" onclick="saveStandings()" style="background: #10b981; border-color: #10b981;">
                    <i data-lucide="save"></i> Guardar Cambios
                </button>
                <button class="btn btn-secondary" onclick="toggleMode('view')">
                    <i data-lucide="arrow-left"></i> Regresar
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Modal para Noticias (mantenido como modal por ahora) -->
<div id="modal-news" class="modal-overlay" style="display: none">
    <div class="modal-content">
        <h3>Nueva Noticia</h3>
        <select id="news-section" class="edit-input" style="margin-bottom: 1rem; background: var(--background);">
            <option value="General">General</option>
            <option value="Liga Betplay">Liga Betplay</option>
            <option value="Selección Colombia">Selección Colombia</option>
            <option value="Champions League">Champions League</option>
            <option value="Mundial 2026">Mundial 2026</option>
            <option value="Charla Técnica">Charla Técnica</option>
            <option value="Efemérides">Efemérides</option>
            <option value="Fórmula 1">Fórmula 1</option>
            <option value="Colombianos Exterior">Colombianos Exterior</option>
        </select>
        <input type="text" id="news-title" placeholder="Título">
        <textarea id="news-content" placeholder="Contenido..." rows="5"></textarea>
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button class="btn" onclick="saveNews()">Publicar</button>
            <button class="btn btn-secondary" onclick="closeModal('news')">Cerrar</button>
        </div>
    </div>
</div>

@push('scripts')
<script>
    let currentStandings = [];

    async function fetchData() {
        try {
            console.log('Fetching data...');
            const [postsRes, standingsRes, matchesRes] = await Promise.all([
                fetch('/api/posts'),
                fetch('/api/standings'),
                fetch('/api/matches')
            ]);
            
            const posts = await postsRes.json();
            const standings = await standingsRes.json();
            const matchesData = await matchesRes.json();
            
            console.log('Posts found:', posts.posts?.length);
            console.log('Standings found:', standings.standings?.length);
            console.log('Matches found:', matchesData.matches?.length);
            
            currentStandings = standings.standings || [];
            
            // Render Matches
            const allMatches = matchesData.matches || [];
            const betplayMatches = allMatches.filter(m => m.tournament !== 'Champions League');
            const uclMatches = allMatches.filter(m => m.tournament === 'Champions League');

            const matchesGrid = document.getElementById('matches-grid');
            const matchesRound = document.getElementById('matches-round');
            
            const renderMatches = (matchesList, gridEl, roundEl, emptyMsg) => {
                if (matchesList.length > 0) {
                    if (roundEl && matchesList[0]?.round) roundEl.textContent = matchesList[0].round;
                    gridEl.innerHTML = matchesList.map(m => {
                        const isFinished = m.status === 'finished';
                        const isLive = m.status === 'live';
                        const isScheduled = m.status === 'scheduled';
                        const statusColor = isFinished ? 'var(--text-muted)' : isLive ? '#22c55e' : 'var(--primary)';
                        const statusLabel = isFinished ? 'Final' : isLive ? '🟢 En Vivo' : (m.match_time || 'Por jugar');
                        const scoreOrTime = isScheduled
                            ? `<span style="font-size: 1rem; font-weight: 600; color: var(--primary);">${m.match_time || '--:--'}</span>`
                            : `<span style="font-size: 1.5rem; font-weight: 900; color: ${isLive ? '#22c55e' : 'white'}; min-width: 60px; text-align: center;">${m.home_score ?? '-'} - ${m.away_score ?? '-'}</span>`;
                        return `
                            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.5rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.05)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                                <div style="display: flex; flex-direction: column; align-items: flex-end; width: 40%;">
                                    <span style="font-weight: 700; font-size: 0.95rem;">${m.home_team}</span>
                                    <span style="font-size: 0.75rem; color: var(--text-muted);">${isFinished ? 'Local' : ''}</span>
                                </div>
                                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 0 1rem;">
                                    ${scoreOrTime}
                                    <span style="font-size: 0.7rem; color: ${statusColor}; font-weight: 600; text-transform: uppercase;">${statusLabel}</span>
                                </div>
                                <div style="display: flex; flex-direction: column; align-items: flex-start; width: 40%;">
                                    <span style="font-weight: 700; font-size: 0.95rem;">${m.away_team}</span>
                                    <span style="font-size: 0.75rem; color: var(--text-muted);">${isFinished ? 'Visitante' : ''}</span>
                                </div>
                            </div>`;
                    }).join('');
                } else {
                    gridEl.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">${emptyMsg}</p>`;
                }
            };

            renderMatches(betplayMatches, matchesGrid, matchesRound, 'Pulsa “IA Marcadores” para cargar los partidos.');
            
            const uclMatchesGrid = document.getElementById('ucl-matches-grid');
            const uclMatchesRound = document.getElementById('ucl-matches-round');
            if(uclMatchesGrid) {
                renderMatches(uclMatches, uclMatchesGrid, uclMatchesRound, 'Pulsa “IA UCL Marcadores” para cargar los partidos.');
            }


        const renderTable = (data, containerId) => {
            const body = document.getElementById(containerId);
            if (!body) return;
            body.innerHTML = data.map(s => `
                <tr>
                    <td><span class="pos-badge ${s.pos <= 3 ? 'pos-top' : ''}">${s.pos}</span></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            ${s.logo ? `<img src="${s.logo}" alt="" style="width: 24px; height: 24px; object-fit: contain;">` : '<div style="width: 24px; height: 24px; background: #333; border-radius: 50%;"></div>'}
                            <strong>${s.team}</strong>
                        </div>
                    </td>
                    <td>${s.pj}</td>
                    <td>${s.won}</td>
                    <td>${s.draw}</td>
                    <td>${s.lost}</td>
                    <td>${s.gf}</td>
                    <td>${s.ga}</td>
                    <td>${s.gd}</td>
                    <td style="font-weight: 900; color: var(--primary);">${s.pts}</td>
                    <td>
                        <div style="display: flex; gap: 4px;">
                            ${(s.form || '').split('').map(res => {
                                let color = '#999';
                                let icon = 'minus-circle';
                                if (res === 'W' || res === 'G') { color = '#22c55e'; icon = 'check-circle'; }
                                if (res === 'L' || res === 'P') { color = '#ef4444'; icon = 'x-circle'; }
                                return `<div style="color: ${color}"><i data-lucide="${icon}" style="width: 18px; height: 18px;"></i></div>`;
                            }).join('')}
                        </div>
                    </td>
                </tr>
            `).join('');
        };

        renderTable(standings.standings.filter(s => s.division === 'A'), 'standings-body-a');
        renderTable(standings.standings.filter(s => s.division === 'B'), 'standings-body-b');
        renderTable(standings.standings.filter(s => s.division === 'UCL_LEAGUE'), 'standings-body-ucl');

        // Render Posts
        const newsGrid = document.getElementById('news-grid');
        newsGrid.innerHTML = posts.posts.map(post => `
            <div class="card">
                <div class="card-content">
                    <span class="card-tag">${post.section}</span>
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-text">${post.content}</p>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    async function runBot(type) {
        const bar = document.getElementById('progress-bar');
        document.getElementById('progress-root').style.display = 'block';
        bar.style.width = '10%';

        try {
            // Animate while waiting
            let pct = 10;
            const interval = setInterval(() => {
                pct = Math.min(pct + 5, 85);
                bar.style.width = pct + '%';
            }, 1000);

            let endpoint = `/api/bot/${type}`;
            if (type === 'ucl-standings') endpoint = '/api/bot/ucl/standings';
            if (type === 'ucl-results') endpoint = '/api/bot/ucl/results';

            const res = await fetch(endpoint);
            clearInterval(interval);

            const data = await res.json();
            bar.style.width = '100%';

            if (data.debug_raw) console.log('[Bot]', data.debug_raw);

            if ((type.includes('standings') && data.standings && data.standings.length > 0) ||
                (type.includes('results') && data.matches && data.matches.length > 0)) {
                const count = type.includes('standings') ? data.standings.length : data.matches.length;
                setTimeout(() => {
                    document.getElementById('progress-root').style.display = 'none';
                    bar.style.width = '0%';
                    fetchData();
                    alert(`✅ IA cargó ${count} ${type.includes('standings') ? 'equipos' : 'partidos'} correctamente.`);
                }, 500);
            } else {
                throw new Error(data.debug_raw || 'No se extrajeron datos.');
            }
        } catch (err) {
            bar.style.width = '0%';
            document.getElementById('progress-root').style.display = 'none';
            alert('❌ Error en el Bot: ' + err.message);
            console.error(err);
        }
    }

    function toggleMode(mode) {
        if (mode === 'edit') {
            document.getElementById('view-mode').style.display = 'none';
            document.getElementById('edit-mode').style.display = 'block';
            renderEditTable();
        } else {
            document.getElementById('view-mode').style.display = 'block';
            document.getElementById('edit-mode').style.display = 'none';
            fetchData();
        }
    }

    async function openStandingsModal() {
        const res = await fetch('/api/standings');
        const data = await res.json();
        currentStandings = data.standings;
        toggleMode('edit');
    }

    function openModal(id) { 
        // News modal stays as a modal for now or we can change it later
        document.getElementById(`modal-${id}`).style.display = 'flex'; 
    }
    function closeModal(id) { document.getElementById(`modal-${id}`).style.display = 'none'; }

    function renderEditTable() {
        const body = document.getElementById('edit-standings-body');
        body.innerHTML = currentStandings.map((s, idx) => `
            <tr>
                <td><input type="text" class="edit-input" value="${s.division || 'A'}" onchange="updateEditValue(${idx}, 'division', this.value.toUpperCase())"></td>
                <td>${s.pos}</td>
                <td><input type="text" class="edit-input" style="font-size: 0.7rem;" value="${s.logo || ''}" onchange="updateEditValue(${idx}, 'logo', this.value)" placeholder="https://..."></td>
                <td><input type="text" class="edit-input" style="font-weight: bold" value="${s.team}" onchange="updateEditValue(${idx}, 'team', this.value)"></td>
                <td><input type="number" class="edit-input" value="${s.pj || 0}" onchange="updateEditValue(${idx}, 'pj', this.value)"></td>
                <td><input type="number" class="edit-input" value="${s.won || 0}" onchange="updateEditValue(${idx}, 'won', this.value)"></td>
                <td><input type="number" class="edit-input" value="${s.draw || 0}" onchange="updateEditValue(${idx}, 'draw', this.value)"></td>
                <td><input type="number" class="edit-input" value="${s.lost || 0}" onchange="updateEditValue(${idx}, 'lost', this.value)"></td>
                <td><input type="number" class="edit-input" value="${s.gf || 0}" onchange="updateEditValue(${idx}, 'gf', this.value)"></td>
                <td><input type="number" class="edit-input" value="${s.ga || 0}" onchange="updateEditValue(${idx}, 'ga', this.value)"></td>
                <td><input type="number" class="edit-input" style="background: #222;" value="${s.gd || 0}" readonly></td>
                <td><input type="number" class="edit-input" style="color: var(--primary); font-weight: 900; background: #222;" value="${s.pts || 0}" readonly></td>
                <td><input type="text" class="edit-input" maxlength="5" value="${s.form || ''}" onchange="updateEditValue(${idx}, 'form', this.value.toUpperCase())"></td>
            </tr>
        `).join('');
    }

    function updateEditValue(idx, field, value) {
        currentStandings[idx][field] = (field === 'team' || field === 'logo' || field === 'form' || field === 'division') ? value : parseInt(value || 0);
        
        // Auto-calculo de Puntos y GD
        const s = currentStandings[idx];
        s.pts = (s.won * 3) + (s.draw * 1);
        s.gd = (s.gf || 0) - (s.ga || 0);
        s.pj = (s.won || 0) + (s.draw || 0) + (s.lost || 0);

        sortAndRender();
    }

    function addTeam() {
        const nextPos = currentStandings.length + 1;
        currentStandings.push({
            pos: nextPos,
            team: 'Nuevo Equipo',
            logo: '',
            pj: 0,
            won: 0,
            draw: 0,
            lost: 0,
            gf: 0,
            ga: 0,
            gd: 0,
            pts: 0,
            form: '-----'
        });
        sortAndRender();
    }

    const TEAMS_A = ["Atlético Nacional", "Millonarios", "Santa Fe", "América de Cali", "Junior", "Independiente Medellín", "Once Caldas", "Deportivo Cali", "Deportes Tolima", "Deportivo Pasto", "Águilas Doradas", "Bucaramanga", "Envigado", "Jaguares", "La Equidad", "Alianza FC", "Boyacá Chicó", "Fortaleza", "Patriotas", "Pereira"];
    const TEAMS_B = ["Atlético Huila", "Cúcuta Deportivo", "Unión Magdalena", "Real Cartagena", "Quindío", "Llaneros", "Orsomarso", "Boca Juniors de Cali", "Real Santander", "Barranquilla FC", "Leones", "Bogotá FC", "Tigres", "Internacional Palmira"];

    function loadColombianTeams(div) {
        if (confirm(`¿Cargar equipos de la Primera ${div}? Se añadirán a la lista actual.`)) {
            const list = div === 'A' ? TEAMS_A : TEAMS_B;
            const newTeams = list.map((name, i) => ({
                division: div,
                pos: 0,
                team: name,
                logo: '',
                pj: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: '-----'
            }));
            currentStandings = [...currentStandings, ...newTeams];
            sortAndRender();
        }
    }

    function sortAndRender() {
        // Ordenar por división, luego por puntos, luego por GD
        currentStandings.sort((a, b) => {
            if (a.division !== b.division) return a.division.localeCompare(b.division);
            if (b.pts !== a.pts) return b.pts - a.pts;
            return b.gd - a.gd;
        });

        // Re-asignar posiciones por división
        let posA = 1, posB = 1;
        currentStandings.forEach(s => {
            if (s.division === 'A') s.pos = posA++;
            else s.pos = posB++;
        });

        renderEditTable();
    }

    async function saveStandings() {
        try {
            const res = await fetch('/api/standings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ standings: currentStandings })
            });
            if (res.ok) {
                alert('¡Tablas actualizadas!');
                toggleMode('view');
            }
        } catch (err) {
            alert('Error al guardar');
        }
    }

    async function saveNews() {
        const section = document.getElementById('news-section').value;
        const title = document.getElementById('news-title').value;
        const content = document.getElementById('news-content').value;

        if (!title || !content) return alert('Por favor, llena el título y el contenido.');

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section, title, content })
            });
            if (res.ok) {
                closeModal('news');
                fetchData();
                // Limpiar campos
                document.getElementById('news-title').value = '';
                document.getElementById('news-content').value = '';
            }
        } catch (err) {
            alert('Error al publicar la noticia');
        }
    }

    window.onload = fetchData;
</script>
<style>
    .modal-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
        z-index: 1000;
    }
    .modal-content {
        background: var(--secondary); padding: 2rem; border-radius: 16px;
        width: 100%; max-width: 500px; border: 1px solid var(--border);
    }
    .modal-content input, .modal-content textarea {
        width: 100%; margin-bottom: 1rem; padding: 0.75rem;
        background: var(--background); border: 1px solid var(--border); color: white;
        border-radius: 8px;
    }
    .edit-input {
        width: 100%;
        background: transparent;
        border: none;
        border-bottom: 1px solid var(--border);
        color: white;
        padding: 4px;
    }
    .edit-input:focus {
        outline: none;
        border-bottom: 1px solid var(--primary);
    }
</style>
@endpush
@endsection
