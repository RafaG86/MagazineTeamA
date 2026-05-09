const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../magazine.db');
const db = new sqlite3.Database(dbPath);

const allTeams = [
  "Águilas Doradas", "Alianza Valledupar", "América de Cali", "Atlético Bucaramanga",
  "Atlético Nacional", "Boyacá Chicó", "Deportes Tolima", "Deportivo Cali",
  "Deportivo Pasto", "Deportivo Pereira", "Envigado F.C.", "Fortaleza CEIF",
  "Independiente Medellín", "Independiente Santa Fe", "Internacional de Bogotá",
  "Junior de Barranquilla", "Llaneros", "Millonarios", "Once Caldas", "Unión Magdalena"
];

// Datos iniciales aproximados para comenzar
const initialStandings = allTeams.map((team, index) => ({
  pos: index + 1,
  team: team,
  pj: 19,
  pts: 0,
  gd: 0
}));

// Ajustamos los que ya sabemos que van arriba según la búsqueda anterior
const topTeams = {
  "Atlético Nacional": { pts: 40, gd: 20 },
  "Junior de Barranquilla": { pts: 35, gd: 7 },
  "Deportivo Pasto": { pts: 34, gd: 4 },
  "América de Cali": { pts: 33, gd: 10 },
  "Once Caldas": { pts: 33, gd: 9 },
  "Deportes Tolima": { pts: 31, gd: 10 },
  "Independiente Santa Fe": { pts: 29, gd: 7 },
  "Internacional de Bogotá": { pts: 28, gd: 0 }
};

const finalData = initialStandings.map(s => {
  if (topTeams[s.team]) {
    return { ...s, pts: topTeams[s.team].pts, gd: topTeams[s.team].gd };
  }
  return s;
}).sort((a, b) => b.pts - a.pts || b.gd - a.gd);

// Re-asignar posiciones después del sort
finalData.forEach((s, i) => s.pos = i + 1);

db.serialize(() => {
  db.run('DELETE FROM standings');
  const stmt = db.prepare('INSERT INTO standings (pos, team, pj, pts, gd) VALUES (?, ?, ?, ?, ?)');
  finalData.forEach(s => {
    stmt.run(s.pos, s.team, s.pj, s.pts, s.gd);
  });
  stmt.finalize();
  console.log('Base de datos actualizada con los 20 equipos de la Liga.');
  db.close();
});
