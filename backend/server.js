const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./whatsapp/client");
const { getQR, getStatus } = require("./whatsapp/client");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static("/opt/solutecno-saas/frontend"));

app.get("/", (req, res) => {
  res.sendFile("/opt/solutecno-saas/frontend/index.html");
});

// endpoint QR en tiempo real
app.get("/qr", (req, res) => {
  const qr = getQR();
  const status = getStatus();

  res.json({
    status,
    qr
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
