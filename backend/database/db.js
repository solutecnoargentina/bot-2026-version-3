const Database = require("better-sqlite3");

const db = new Database("/opt/solutecno-saas/backend/database/solutecno.db");

db.exec(`
CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  telefono TEXT,
  estado TEXT
);

CREATE TABLE IF NOT EXISTS instancias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER,
  tipo TEXT,
  estado TEXT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATETIME
);
`);

module.exports = db;
