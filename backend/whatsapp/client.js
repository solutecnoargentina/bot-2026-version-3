const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

const clients = {};

function createClient(instanceId) {

  if (clients[instanceId]) {
    return clients[instanceId];
  }

  console.log("Creando cliente nuevo:", instanceId);

  let currentQR = null;
  let status = "disconnected";

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: "client-" + instanceId,
      dataPath: "/opt/solutecno-saas/sessions"
    }),
    puppeteer: {
      headless: true,
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
  });

  client.on("qr", async (qr) => {
    console.log("QR generado para instancia", instanceId);
    currentQR = await qrcode.toDataURL(qr);
    status = "qr";
  });

  client.on("ready", () => {
    console.log("WhatsApp conectado instancia", instanceId);
    status = "connected";
    currentQR = null;
  });

  client.on("disconnected", () => {
    console.log("WhatsApp desconectado instancia", instanceId);
    status = "disconnected";
  });

  client.initialize();

  clients[instanceId] = {
    client,
    getQR: () => currentQR,
    getStatus: () => status
  };

  return clients[instanceId];
}

function getClient(instanceId) {
  return clients[instanceId];
}

module.exports = {
  createClient,
  getClient
};
