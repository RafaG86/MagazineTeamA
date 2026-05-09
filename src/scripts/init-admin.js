const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../magazine.db');
const db = new sqlite3.Database(dbPath);

const username = 'admin';
const password = 'admin-password'; // En producción esto debería ser hasheado
const role = 'admin';

db.serialize(() => {
  // Asegurar que la columna existe (por si acaso el ALTER TABLE falló o no se ejecutó)
  db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => {
    if (err) {
      console.log("La columna 'role' ya existe o hubo un error esperado.");
    }
  });

  db.run(
    'INSERT OR REPLACE INTO users (id, username, password, role) VALUES (1, ?, ?, ?)',
    [username, password, role],
    function(err) {
      if (err) {
        console.error('Error creando admin:', err.message);
      } else {
        console.log(`Usuario administrador creado: ${username}`);
      }
      db.close();
    }
  );
});
