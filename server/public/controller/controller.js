let ws = null;
let connected = false;
let player = 1;
let reconnectTimer = null;

const statusDot = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const playerBadge = document.getElementById('player-badge');
const connectScreen = document.getElementById('connect-screen');
const controller = document.getElementById('controller');
const serverInput = document.getElementById('server-address');
const connectBtn = document.getElementById('connect-btn');
const connectError = document.getElementById('connect-error');

function connect() {
  let address = serverInput.value.trim();
  if (!address) {
    address = serverInput.placeholder;
  }
  if (!address.includes(':')) {
    address = address + ':3000';
  }
  const url = `ws://${address}`;

  if (ws) {
    ws.close();
  }

  ws = new WebSocket(url);

  ws.onopen = () => {
    setConnected(true);
    connectError.classList.add('hidden');
    ws.send(JSON.stringify({ type: 'join', player: player }));
  };

  ws.onclose = () => {
    setConnected(false);
  };

  ws.onerror = () => {
    setConnected(false);
    connectError.classList.remove('hidden');
  };
}

function setConnected(conn) {
  connected = conn;
  statusDot.className = 'status-dot ' + (conn ? 'connected' : 'disconnected');
  statusText.textContent = conn ? 'Connected' : 'Disconnected';
  if (conn) {
    connectScreen.classList.add('hidden');
    controller.classList.remove('hidden');
  } else {
    connectScreen.classList.remove('hidden');
    controller.classList.add('hidden');
  }
}

function sendInput(action, pressed) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({
    type: 'input',
    action: action,
    pressed: pressed,
    player: player
  }));
}

function togglePlayer() {
  player = player === 1 ? 2 : 1;
  playerBadge.textContent = 'P' + player;
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'join', player: player }));
  }
}

connectBtn.addEventListener('click', connect);
serverInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') connect();
});

playerBadge.addEventListener('click', togglePlayer);

document.getElementById('disconnect-btn').addEventListener('click', () => {
  if (ws) ws.close();
  setConnected(false);
});

const buttons = document.querySelectorAll('.dpad-btn, .face-btn');

document.addEventListener('touchmove', (e) => {
  if (connected) e.preventDefault();
}, { passive: false });

buttons.forEach(btn => {
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const action = btn.dataset.action;
    if (!btn.classList.contains('pressed')) {
      btn.classList.add('pressed');
      sendInput(action, true);
    }
  });

  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    const action = btn.dataset.action;
    if (btn.classList.contains('pressed')) {
      btn.classList.remove('pressed');
      sendInput(action, false);
    }
  });

  btn.addEventListener('touchcancel', (e) => {
    const action = btn.dataset.action;
    if (btn.classList.contains('pressed')) {
      btn.classList.remove('pressed');
      sendInput(action, false);
    }
  });

  btn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const action = btn.dataset.action;
    if (!btn.classList.contains('pressed')) {
      btn.classList.add('pressed');
      sendInput(action, true);
    }
  });

  btn.addEventListener('mouseup', (e) => {
    e.preventDefault();
    const action = btn.dataset.action;
    if (btn.classList.contains('pressed')) {
      btn.classList.remove('pressed');
      sendInput(action, false);
    }
  });

  btn.addEventListener('mouseleave', (e) => {
    const action = btn.dataset.action;
    if (btn.classList.contains('pressed')) {
      btn.classList.remove('pressed');
      sendInput(action, false);
    }
  });
});
