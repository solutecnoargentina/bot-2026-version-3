const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

let currentQR = null;
let clientStatus = "disconnected";

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "/opt/solutecno-saas/sessions"
  }),
  puppeteer: {
    headless: true,
    executablePath: "/usr/bin/chromium-browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
});

client.on("qr", async (qr) => {
  console.log("Nuevo QR generado");

  currentQR = await qrcode.toDataURL(qr);
  clientStatus = "qr";
});

client.on("ready", () => {
  console.log("WhatsApp conectado");
  clientStatus = "connected";
  currentQR = null;
});

client.on("disconnected", () => {
  console.log("WhatsApp desconectado");
  clientStatus = "disconnected";
});

client.initialize();

module.exports = {
  getQR: () => currentQR,
  getStatus: () => clientStatus
};
