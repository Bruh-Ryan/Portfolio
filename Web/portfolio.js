/* ========================================
   WARM EARTHY RETRO PORTFOLIO - JAVASCRIPT
   Bidirectional Animation & Interactions
   ======================================== */

// ========================================
// 1. BIDIRECTIONAL REEL ANIMATION (Hero Observer)
// ========================================

const filmReel = document.getElementById('filmReel');
const heroSection = document.getElementById('hero');

// Options for the Intersection Observer
// threshold: 0 means trigger as soon as even 1px of hero is visible (or leaves)
const heroObserverOptions = {
    root: null, // viewport
    threshold: 0,
    rootMargin: "-50px 0px 0px 0px" // Offset slightly so it triggers just before reaching top?
    // Actually, simple is better: if hero is in view, hide reel.
};

const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Hero IS visible -> Landing page mode -> Hide Reel
            filmReel.classList.add('hidden');
            filmReel.classList.remove('visible');
            console.log('Hero Visible -> Reel Hidden');
        } else {
            // Hero is NOT visible -> Scrolled down -> Show Reel
            filmReel.classList.remove('hidden');
            filmReel.classList.add('visible');
            console.log('Hero Left View -> Reel Visible');
        }
    });
}, heroObserverOptions);

// Start observing the hero section
if (heroSection) {
    heroObserver.observe(heroSection);
}

// ========================================
// 2. SCROLL-SYNCED NAVIGATION
// ========================================

const sectionObserverOptions = {
    threshold: 0.5, // Trigger when 50% of section is visible
    rootMargin: "-10% 0px"
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Highlight the corresponding frame
            const id = entry.target.id;
            updateActiveFrame(id);

            // Add visible class for fade-in effect
            entry.target.classList.add('visible');
        }
    });
}, sectionObserverOptions);

// Observe all content sections
document.querySelectorAll('.content-section').forEach(section => {
    sectionObserver.observe(section);
});

function updateActiveFrame(sectionId) {
    // Remove active class from all
    document.querySelectorAll('.film-frame').forEach(f => f.classList.remove('active'));

    // Add to current
    const activeFrame = document.querySelector(`.film-frame[data-section="${sectionId}"]`);
    if (activeFrame) {
        activeFrame.classList.add('active');

        // Scroll reel to specific frame if needed (optional polish)
        activeFrame.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
}

// ========================================
// 3. CLICK NAVIGATION & INTERACTION
// ========================================

// Handle Frame Clicks
document.querySelectorAll('.film-frame').forEach(frame => {
    frame.addEventListener('click', (e) => {
        const targetId = frame.getAttribute('data-section');
        const videoUrl = frame.getAttribute('data-video');

        // Check if clicking play button specifically
        if (e.target.closest('.play-icon') && videoUrl) {
            e.stopPropagation(); // Don't scroll, just play
            openVideo(videoUrl);
        } else {
            // Scroll to section
            const section = document.getElementById(targetId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Scroll Indicator in Hero
document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
    const firstSection = document.querySelector('.content-container section:first-of-type');
    if (firstSection) firstSection.scrollIntoView({ behavior: 'smooth' });
});

// ========================================
// 4. VIDEO OVERLAY LOGIC
// ========================================

const videoOverlay = document.getElementById('videoOverlay');
const videoFrame = document.getElementById('videoFrame');

function openVideo(url) {
    if (!videoOverlay || !videoFrame) return;

    videoOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scroll

    let embedUrl = url;

    // Convert Cloudinary video URLs to player embed format
    if (url.includes('cloudinary.com/') && url.includes('/video/upload/')) {
        // Extract cloud name and public ID from the URL
        const cloudNameMatch = url.match(/cloudinary\.com\/([^/]+)\//);
        const publicIdMatch = url.match(/\/upload\/v\d+\/([^.]+)/);

        if (cloudNameMatch && publicIdMatch) {
            const cloudName = cloudNameMatch[1];
            const publicId = publicIdMatch[1];
            embedUrl = `https://player.cloudinary.com/embed/?cloud_name=${cloudName}&public_id=${publicId}&fluid=true&controls=true&autoplay=true`;
            console.log('Cloudinary Embed URL:', embedUrl);
        }
    } else if (!url.includes('player.cloudinary.com') && !url.includes('youtube.com') && !url.includes('vimeo.com')) {
        // For other video URLs, add autoplay if needed
        embedUrl = url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
    }

    videoFrame.src = embedUrl;
    console.log('Opening video:', embedUrl);
}

window.closeVideoOverlay = function () {
    if (!videoOverlay) return;
    videoOverlay.classList.remove('active');

    setTimeout(() => {
        if (videoFrame) videoFrame.src = ''; // Stop video
    }, 300);
    document.body.style.overflow = ''; // Unlock scroll
};

// Close on background click
videoOverlay?.addEventListener('click', (e) => {
    if (e.target === videoOverlay) closeVideoOverlay();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoOverlay();
});

// ========================================
// 5. INITIALIZATION
// ========================================

window.addEventListener('load', () => {
    console.log('Warm Earthy Retro Portfolio Initialized 🌿');

    // Ensure reel is in correct state on load
    // Ensure reel is in correct state on load
    if (window.scrollY === 0) {
        filmReel.classList.add('hidden');
    } else {
        filmReel.classList.remove('hidden');
    }
});

// ========================================
// 6. PHONE CONTROLLER (postMessage Bridge)
// ========================================

const KEY_MAP = {
  1: {
    up:     { key: 'w',         code: 'KeyW' },
    left:   { key: 'a',         code: 'KeyA' },
    right:  { key: 'd',         code: 'KeyD' },
    down:   { key: 's',         code: 'KeyS' },
    face_a: { key: 'e',         code: 'KeyE' },
    face_b: { key: 'j',         code: 'KeyJ' },
    face_x: { key: 'x',         code: 'KeyX' },
    face_y: { key: 'y',         code: 'KeyY' },
  },
  2: {
    up:     { key: 'ArrowUp',    code: 'ArrowUp' },
    left:   { key: 'ArrowLeft',  code: 'ArrowLeft' },
    right:  { key: 'ArrowRight', code: 'ArrowRight' },
    down:   { key: 'ArrowDown',  code: 'ArrowDown' },
    face_a: { key: '/',          code: 'Slash' },
    face_b: { key: 'k',         code: 'KeyK' },
    face_x: { key: 'x',         code: 'KeyX' },
    face_y: { key: 'y',         code: 'KeyY' },
  }
};

function dispatchControllerInput(msg) {
  if (!msg || msg.type !== 'input') return;
  const player = msg.player || 1;
  const keyMap = KEY_MAP[player];
  if (!keyMap) return;
  const mapping = keyMap[msg.action];
  if (!mapping) return;
  const gameFrame = document.getElementById('gameFrame');
  if (!gameFrame || !gameFrame.contentWindow) return;
  const eventType = msg.pressed ? 'keydown' : 'keyup';
  const keyboardEvent = new KeyboardEvent(eventType, {
    key: mapping.key,
    code: mapping.code,
    bubbles: true,
    cancelable: true,
  });
  gameFrame.contentWindow.dispatchEvent(keyboardEvent);
  if (gameFrame.contentDocument) {
    gameFrame.contentDocument.dispatchEvent(keyboardEvent);
  }
  console.log(`Controller: ${msg.action} ${msg.pressed ? 'pressed' : 'released'} (P${msg.player})`);
}

window.addEventListener('message', (event) => {
  dispatchControllerInput(event.data);
});

const gameOverlay = document.getElementById('gameOverlay');
const gameFrame = document.getElementById('gameFrame');
let gameCloseTimer = null;

window.openGame = function () {
    if (!gameOverlay || !gameFrame) return;
    if (gameCloseTimer) {
        clearTimeout(gameCloseTimer);
        gameCloseTimer = null;
    }
    gameFrame.src = "VolleyBeach/exports/VolleyBeach/VolleyBeach.html";
    gameOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log("Game Opened: VolleyBeach");
};

window.closeGame = function () {
    if (!gameOverlay) return;
    gameOverlay.classList.remove('active');

    gameCloseTimer = setTimeout(() => {
        if (gameFrame) gameFrame.src = "";
        gameCloseTimer = null;
    }, 300);

    document.body.style.overflow = '';
    controllerCleanup();
    console.log("Game Closed");
};

// ========================================
// 7. MOBILE CONTROLLER PANEL (PeerJS)
// ========================================

const controllerOverlay = document.getElementById('controllerOverlay');
const controllerStatusDot = document.getElementById('controllerStatusDot');
const controllerStatusText = document.getElementById('controllerStatusText');

let controllerPeer = null;
let controllerConn = null;
let controllerQR1 = null;
let controllerQR2 = null;
let currentRoomCode = '';
let inactivityInterval = null;
let lastInputTime = 0;

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function setControllerStatus(state, text) {
    controllerStatusDot.className = 'controller-status-dot';
    if (state) controllerStatusDot.classList.add(state);
    controllerStatusText.textContent = text;
}

function startInactivityTimer() {
    stopInactivityTimer();
    lastInputTime = Date.now();
    inactivityInterval = setInterval(() => {
        if (Date.now() - lastInputTime > 180000) {
            setControllerStatus('idle', 'No activity — reconnect via QR');
        }
    }, 5000);
}

function stopInactivityTimer() {
    if (inactivityInterval) {
        clearInterval(inactivityInterval);
        inactivityInterval = null;
    }
}

function controllerCleanup() {
    stopInactivityTimer();
    if (controllerPeer) {
        controllerPeer.destroy();
        controllerPeer = null;
    }
    controllerConn = null;
    currentRoomCode = '';
    if (controllerConn) {
        controllerConn = null;
    }
}

window.openControllerPanel = function () {
    if (!controllerOverlay) return;

    controllerCleanup();

    currentRoomCode = generateRoomCode();
    const peerId = 'vb-' + currentRoomCode;
    document.getElementById('roomCodeDisplay').textContent = currentRoomCode;

    const baseUrl = window.location.origin;
    const urlP1 = baseUrl + '/controller.html?room=' + currentRoomCode + '&player=1';
    const urlP2 = baseUrl + '/controller.html?room=' + currentRoomCode + '&player=2';

    document.getElementById('qrUrlP1').textContent = urlP1;
    document.getElementById('qrUrlP2').textContent = urlP2;

    if (typeof QRCode !== 'undefined') {
        const el1 = document.getElementById('qrP1');
        const el2 = document.getElementById('qrP2');
        el1.innerHTML = '';
        el2.innerHTML = '';
        controllerQR1 = new QRCode(el1, {
            text: urlP1, width: 200, height: 200,
            colorDark: '#3A7D44', colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        controllerQR2 = new QRCode(el2, {
            text: urlP2, width: 200, height: 200,
            colorDark: '#3A7D44', colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    setControllerStatus('', 'Initializing...');

    controllerPeer = new Peer(peerId);

    controllerPeer.on('open', () => {
        setControllerStatus('', 'Waiting for phone — scan a QR code above');
        startInactivityTimer();
        console.log('Controller peer ready: ' + peerId);
    });

    controllerPeer.on('connection', (conn) => {
        controllerConn = conn;
        const playerLabel = 'P' + (conn.metadata ? conn.metadata.player : '?');
        setControllerStatus('connected', playerLabel + ' connected!');
        lastInputTime = Date.now();
        console.log('Phone connected: ' + playerLabel);

        conn.on('data', (data) => {
            if (data && data.type === 'input') {
                lastInputTime = Date.now();
                dispatchControllerInput(data);
            }
        });

        conn.on('close', () => {
            controllerConn = null;
            setControllerStatus('disconnected', 'Phone disconnected — scan QR again');
            console.log('Phone disconnected');
        });
    });

    controllerPeer.on('error', (err) => {
        console.error('Controller peer error:', err);
        if (err.type === 'unavailable-id') {
            setControllerStatus('disconnected', 'Room code taken — generating a new one');
            setTimeout(() => openControllerPanel(), 500);
        } else {
            setControllerStatus('disconnected', 'Connection error — try again');
        }
    });

    controllerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log("Controller Panel Opened");
};

window.closeControllerPanel = function () {
    if (!controllerOverlay) return;
    controllerOverlay.classList.remove('active');
    document.body.style.overflow = '';

    if (controllerConn && controllerConn.open) {
        setControllerStatus('connected', 'Phone connected');
    } else if (controllerPeer && controllerPeer.open) {
        setControllerStatus('', 'Waiting for phone');
    }

    console.log("Controller Panel Closed");
};
