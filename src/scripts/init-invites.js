const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../magazine.db');
const db = new sqlite3.Database(dbPath);

const codes = ['DEPORTE2026', 'INVITADO1', 'PREMIUM24'];

db.serialize(() => {
  const stmt = db.prepare('INSERT OR IGNORE INTO invitations (code) VALUES (?)');
  codes.forEach(code => {
    stmt.run(code);
  });
  stmt.finalize();
  console.log('Códigos de invitación creados:', codes.join(', '));
  db.close();
});
