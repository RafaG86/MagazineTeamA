const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../magazine.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  const stmt = db.prepare('INSERT OR REPLACE INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)');
  
  // Usuarios existentes (los mantenemos)
  stmt.run('admin', 'admin-password', 'admin', 'admin', 'admin@magazine.com');
  stmt.run('invitado', 'invitado123', 'user', 'invitado', 'invitado@magazine.com');
  
  // Nuevos usuarios solicitados
  stmt.run('locutor1', 'team-a-2026', 'user', 'locutor1', 'locutor1@magazine.com');
  stmt.run('periodista1', 'noticias-encasa', 'user', 'periodista1', 'periodista1@magazine.com');
  stmt.run('oyente-premium', 'radio-premium', 'user', 'oyente-premium', 'oyente-premium@magazine.com');
  
  stmt.finalize();
  
  console.log('Base de datos actualizada. Total: 5 usuarios configurados.');
  db.close();
});
