const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../magazine.db');
const db = new sqlite3.Database(dbPath);

const admins = [
  { username: 'AndresR', password: 'AndresR2026', role: 'admin' },
  { username: 'JohnOc', password: 'JohnOc2026', role: 'admin' },
  { username: 'RafaG', password: 'RafaG2026', role: 'admin' },
  { username: 'JaviCe', password: 'JaviCe2026', role: 'admin' }
];

db.serialize(() => {
  admins.forEach((admin) => {
    db.run(
      'INSERT OR REPLACE INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)',
      [admin.username, admin.password, admin.role, admin.username, admin.username.toLowerCase() + '@magazine.com'],
      function(err) {
        if (err) {
          console.error(`Error creando a ${admin.username}:`, err.message);
        } else {
          console.log(`Usuario administrador creado: ${admin.username} (Password: ${admin.password})`);
        }
      }
    );
  });
});

db.close();
