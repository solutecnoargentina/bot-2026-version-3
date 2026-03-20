const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./database/db");

require("./whatsapp/client");
const { getQR, getStatus } = require("./whatsapp/client");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static("/opt/solutecno-saas/frontend"));

app.get("/", (req, res) => {
  res.sendFile("/opt/solutecno-saas/frontend/index.html");
});

// QR
app.get("/qr", (req, res) => {
  res.json({
    status: getStatus(),
    qr: getQR()
  });
});

// CREAR CLIENTE
app.post("/clientes", (req, res) => {
  const { nombre, telefono } = req.body;

  if (!nombre || !telefono) {
    return res.json({ error: "Faltan datos" });
  }

  db.prepare(`
    INSERT INTO clientes (nombre, telefono, estado)
    VALUES (?, ?, ?)
  `).run(nombre, telefono, "activo");

  res.json({ status: "cliente creado" });
});

// LISTAR CLIENTES
app.get("/clientes", (req, res) => {
  const clientes = db.prepare("SELECT * FROM clientes").all();
  res.json(clientes);
});

// CREAR INSTANCIA (con limite demo + expiracion)
app.post("/instancias", (req, res) => {
  const { cliente_id, tipo } = req.body;

  if (!cliente_id || !tipo) {
    return res.json({ error: "Faltan datos" });
  }


if (tipo === "demo") {
  const total = db.prepare("SELECT COUNT(*) as count FROM instancias WHERE tipo = 'demo'").get();

  if (total.count >= 3) {
    return res.json({ error: "Limite de demos alcanzado" });
  }

  // sumar 24 horas
  const ahora = new Date();
  ahora.setHours(ahora.getHours() + 24);
  fechaExpiracion = ahora.toISOString();
}

  let fechaExpiracion = null;

  if (tipo === "demo") {
    const ahora = new Date();
    ahora.setHours(ahora.getHours() + 24);
    fechaExpiracion = ahora.toISOString();
  }

  db.prepare(`
    INSERT INTO instancias (cliente_id, tipo, estado, fecha_expiracion)
    VALUES (?, ?, ?, ?)
  `).run(cliente_id, tipo, "activa", fechaExpiracion);

  res.json({ status: "instancia creada" });
});

// LISTAR INSTANCIAS
app.get("/instancias", (req, res) => {
  const instancias = db.prepare("SELECT * FROM instancias").all();
  res.json(instancias);
});

const PORT = 3000;
// eliminar demos vencidas al iniciar
const ahora = new Date().toISOString();

db.prepare(`
  DELETE FROM instancias
  WHERE tipo = 'demo'
  AND fecha_expiracion IS NOT NULL
  AND fecha_expiracion < ?
`).run(ahora);

console.log("Demos vencidas eliminadas si existían");
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
// eliminar demos vencidas cada 1 minuto
setInterval(() => {
  try {
    const ahora = new Date().toISOString();

    const eliminadas = db.prepare(`
      DELETE FROM instancias
      WHERE tipo = 'demo'
      AND fecha_expiracion IS NOT NULL
      AND fecha_expiracion < ?
    `).run(ahora);

    if (eliminadas.changes > 0) {
      console.log("Instancias demo eliminadas:", eliminadas.changes);
    }

  } catch (error) {
    console.log("Error limpieza demos:", error);
  }
}, 60000);
