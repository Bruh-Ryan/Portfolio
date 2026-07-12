const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, 'public')));

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIP = getLocalIP();
const fullUrl = `http://${localIP}:${PORT}`;

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`Client connected: ${clientIP}`);

  ws.on('message', (data) => {
    const msg = data.toString();
    console.log(`Received: ${msg}`);
    try {
      const parsed = JSON.parse(msg);
      if (parsed.type === 'input') {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(msg);
          }
        });
      }
    } catch (e) {
      console.error('Invalid message:', msg);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${clientIP}`);
  });
});

app.get('/', (req, res) => {
  const controllerUrl = `http://${localIP}:${PORT}/controller`;
  QRCode.toString(controllerUrl, { type: 'terminal', small: true }, (err, qr) => {
    if (err) {
      res.send(`Server running at ${fullUrl}`);
      return;
    }
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Game Controller Server</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: monospace; background: #1a1a2e; color: #eee; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
        h1 { color: #e94560; font-size: 1.5rem; }
        .url { color: #0f0; font-size: 1.2rem; margin: 10px 0; }
        .qr { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .links { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
        .links a { color: #0ff; font-size: 1.1rem; }
        .note { color: #888; font-size: 0.9rem; margin-top: 20px; }
        .step { color: #ff9800; font-size: 0.95rem; margin: 5px 0; }
      </style>
    </head>
    <body>
      <h1>Game Controller Server</h1>
      <p class="url">Server: ${fullUrl}</p>
      <p class="step">1. Scan QR code with your phone → opens controller</p>
      <p class="step">2. Open <a href="/bridge">Bridge</a> on this computer</p>
      <p class="step">3. Click "Open Game & Connect" in the bridge</p>
      <p class="step">4. Tap buttons on your phone to control the game</p>
      <div class="qr"><img src="/qr" alt="QR Code"></div>
      <div class="links">
        <a href="/controller">Open Controller</a>
        <a href="/bridge">Open Bridge</a>
      </div>
      <p class="note">Scan the QR code with your phone to open the controller</p>
    </body>
    </html>
  `);
  });
});

app.get('/qr', (req, res) => {
  const controllerUrl = `http://${localIP}:${PORT}/controller`;
  QRCode.toDataURL(controllerUrl, { width: 300, margin: 2 }, (err, url) => {
    if (err) {
      res.status(500).send('Error generating QR code');
      return;
    }
    res.send(`<img src="${url}" alt="QR Code">`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Game Controller Server`);
  console.log(`  ─────────────────────`);
  console.log(`  Local:    http://localhost:${PORT}`);
  console.log(`  Network:  http://${localIP}:${PORT}`);
  console.log(`  Controller: http://${localIP}:${PORT}/controller`);
  console.log(`  Bridge:   http://localhost:${PORT}/bridge`);
  console.log(`  QR:       http://localhost:${PORT}/\n`);
});
