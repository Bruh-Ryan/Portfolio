# Mobile Phone Controller — Connection Architecture

## Decision History

### Option A: Local WebSocket Server (Original — Rejected)
- `npm start` required on laptop
- Both devices on same WiFi
- Works only locally, not on Vercel
- Too much friction — user must run a terminal command

### Option B: Public WebSocket Relay
- Requires hosting a relay server (Railway/Fly.io)
- Adds monthly cost and deployment complexity
- Rejected — overcomplicated for a LAN-style controller

### Option C: PeerJS P2P (Chosen)
- Zero setup — no terminal, no server, no WiFi restriction
- Free public signaling cloud (PeerJS)
- Works on Vercel (static only)
- Cross-network (phone on mobile data can connect)

---

## Current Architecture

```
┌─ Vercel (portfolio.vercel.app) ─────────────────────┐
│                                                      │
│  portfolio.js                                         │
│    ├── PeerJS peer ID: vb-X7K3M9                    │
│    ├── Listens for incoming DataChannel connections  │
│    ├── On input msg → dispatchControllerInput()      │
│    │       → KeyboardEvent into game iframe          │
│    └── 3-minute inactivity timeout                   │
│                                                      │
│  index.html                                           │
│    ├── PeerJS CDN: unpkg.com/peerjs@1.5.4            │
│    └── QRCode CDN: cdnjs.cloudflare.com/qrcodejs     │
│                                                      │
│  controller.html (served as static)                   │
│    ├── Reads ?room=X7K3M9&player=1 from URL          │
│    ├── Connects to Peer vb-X7K3M9                    │
│    ├── Touch D-pad + face buttons                    │
│    └── Sends { type, action, pressed, player }       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Data Flow

```
Phone touch → PeerJS DataChannel → Portfolio → dispatchControllerInput()
  → KeyboardEvent{ key: 'w', code: 'KeyW' }
  → gameFrame.contentWindow.dispatchEvent()
  → Godot Input.is_action_just_pressed("jump") fires
```

### Key Mapping (from KEY_MAP in portfolio.js)

| Player | Action | Keyboard | Game Input |
|--------|--------|----------|------------|
| P1     | up     | W        | jump       |
| P1     | left   | A        | move_left  |
| P1     | right  | D        | move_right |
| P1     | face_a | E        | smash      |
| P1     | face_b | J        | reset left |
| P2     | up     | ArrowUp  | jump       |
| P2     | left   | ArrowLeft | move_left  |
| P2     | right  | ArrowRight | move_right |
| P2     | face_a | /        | smash      |
| P2     | face_b | K        | reset right |

---

## Files Modified

### New: Web/controller.html
Standalone static touch controller page. Served by Vercel.
- Reads `?room=` and `?player=` from URL params
- Creates PeerJS peer (auto-generated ID)
- Connects to host peer `vb-<roomcode>`
- Touch D-pad (up/down/left/right) with multi-touch
- 4 face buttons (A=Smash, B=Reset, X, Y) — labels change per player
- Player badge shows P1 or P2
- Face button keys: P1 = [E]/[J], P2 = [/]/[K]
- Auto-reconnect on disconnect (up to 5 attempts)
- 10-second connection timeout
- Retro styling matching portfolio (dark green bg, orange accents, Press Start 2P + VT323)

### Modified: Web/portfolio.js
- **Extracted** `dispatchControllerInput(msg)` from the postMessage handler — reusable for both postMessage and PeerJS
- **Replaced** Section 7 completely:
  - `generateRoomCode()` — 6-char alphanumeric (`ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`)
  - `openControllerPanel()` — creates PeerJS peer with ID `vb-<roomcode>`, generates QR codes via qrcodejs CDN, sets up connection handler
  - `closeControllerPanel()` — hides overlay, keeps PeerJS alive
  - `controllerCleanup()` — destroys PeerJS peer (called by `closeGame()`)
  - `startInactivityTimer()` / `stopInactivityTimer()` — 3-minute inactivity timeout
  - `setControllerStatus()` — updates status dot and text
- **Modified** `closeGame()` — calls `controllerCleanup()` to destroy PeerJS when game closes
- Removed `getLocalIP()` and `drawQRPlaceholder()` — no longer needed

### Modified: Web/index.html
- Added CDN script tags before `portfolio.js`:
  - `unpkg.com/peerjs@1.5.4/dist/peerjs.min.js`
  - `cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`
- Changed QR code containers from `<canvas>` to `<div>` (qrcodejs creates canvas internally)
- Added room code display element (`#roomCodeDisplay`)

### Modified: Web/portfolio.css
- Updated `.qr-code` to be a flex container (for qrcodejs div)
- Added `.qr-code canvas` style
- Added `.controller-status-dot.idle` (orange for inactivity)
- Added `.controller-room-code` style (bold retro text)

---

## Edge Cases & Failure Modes

| Scenario | Behavior |
|----------|----------|
| Phone scans QR but portfolio panel not open | PeerJS shows "Waiting for portfolio..." — retries every 3s |
| Phone opens controller but no QR scanned | `?room` missing → shows "Invalid QR code" error |
| Connection lost mid-game | Portfolio shows yellow "Disconnected"; phone auto-retries |
| 3 minutes of no inputs | Portfolio shows orange "No activity — reconnect via QR" |
| Portfolio closes controller panel | Peer stays alive; phone still works when game is open |
| Portfolio closes game | Peer is destroyed; phone shows "Disconnected" |
| Room code collision (unlikely) | PeerJS fires `unavailable-id` error → generates new room code |
| CDN failure (PeerJS/qrcodejs) | QR codes show URL text fallback; Peer creation throws error caught gracefully |
| Two phones connect | Each gets its own DataChannel; both work independently |
| Vercel deployment | Controller.html served as static file — no server changes needed |

---

## Connection Lifecycle

1. User clicks "Mobile Controller"
2. `openControllerPanel()` fires:
   - Room code generated (e.g., `X7K3M9`)
   - Peer created with ID `vb-X7K3M9`
   - QR1: `https://domain/controller.html?room=X7K3M9&player=1`
   - QR2: `https://domain/controller.html?room=X7K3M9&player=2`
   - Status: grey "Waiting for phone..."
3. Phone scans P1 QR
4. `controller.html` loads → creates Peer → connects to `vb-X7K3M9`
5. Portfolio receives `connection` event:
   - Status: green "P1 connected!"
   - Inactivity timer resets
6. Phone sends inputs → Portfolio dispatches KeyboardEvents → Game plays
7. User can close controller panel — Peer stays alive
8. User opens game — phone already works
9. User closes game — Peer destroyed, connection cleaned up

---

## Local Development

```bash
# Serve the Web folder to test locally
python3 -m http.server 8080 --directory Web
# Then open http://localhost:8080
```

No `npm start` or local server needed. The phone connects through PeerJS cloud signaling.
