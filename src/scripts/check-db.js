const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../../magazine.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM standings', (err, rows) => {
  if (err) {
    console.error('Error al leer tabla:', err.message);
  } else {
    console.log('Filas encontradas en standings:', rows.length);
    console.log(rows);
  }
  db.close();
});
