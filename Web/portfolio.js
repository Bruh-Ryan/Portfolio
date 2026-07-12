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
  if (!gameFrame || !gameFrame.src) return;

  const eventType = msg.pressed ? 'keydown' : 'keyup';
  const keyboardEvent = new KeyboardEvent(eventType, {
    key: mapping.key,
    code: mapping.code,
    bubbles: true,
    cancelable: true,
  });

  document.dispatchEvent(keyboardEvent);
  window.dispatchEvent(keyboardEvent);

  try {
    if (gameFrame.contentWindow)
      gameFrame.contentWindow.dispatchEvent(keyboardEvent);
    if (gameFrame.contentDocument)
      gameFrame.contentDocument.dispatchEvent(keyboardEvent);
  } catch(e) {
    // cross-origin blocked — main document dispatch is the fallback
  }
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
// 7. MOBILE CONTROLLER PANEL (Ably)
// ========================================

const controllerOverlay = document.getElementById('controllerOverlay');

const playerState = {
  1: { dot: document.getElementById('statusDotP1'), text: document.getElementById('statusTextP1'), lastInput: 0 },
  2: { dot: document.getElementById('statusDotP2'), text: document.getElementById('statusTextP2'), lastInput: 0 }
};

let ablyClient = null;
let ablyChannel = null;
let controllerQR1 = null;
let controllerQR2 = null;
let currentRoomCode = '';
let inactivityInterval = null;

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function setPlayerStatus(player, state, text) {
    const p = playerState[player];
    if (!p) return;
    p.dot.className = 'controller-status-dot';
    if (state) p.dot.classList.add(state);
    p.text.textContent = text;
}

function startInactivityTimer() {
    stopInactivityTimer();
    [1, 2].forEach(p => { playerState[p].lastInput = 0; });
    inactivityInterval = setInterval(() => {
        [1, 2].forEach(p => {
            const ps = playerState[p];
            if (ps.lastInput > 0 && Date.now() - ps.lastInput > 180000) {
                setPlayerStatus(p, 'idle', 'P' + p + ' — no activity');
            }
        });
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
    if (ablyClient) {
        ablyClient.close();
        ablyClient = null;
    }
    ablyChannel = null;
    [1, 2].forEach(p => {
        playerState[p].lastInput = 0;
        setPlayerStatus(p, '', 'P' + p + ' — Waiting...');
    });
    controllerQR1 = null;
    controllerQR2 = null;
    currentRoomCode = '';
}

function setupAblyChannel() {
    ablyChannel = ablyClient.channels.get('vb-' + currentRoomCode);
    ablyChannel.subscribe('input', (msg) => {
        console.log('[ABLY] Message received on desktop:', msg.data);
        const data = msg.data;
        if (data.type === 'ping') return;
        const player = data.player || 1;
        playerState[player].lastInput = Date.now();
        setPlayerStatus(player, 'connected', 'P' + player + ' connected!');
        stopInactivityTimer();
        startInactivityTimer();
        dispatchControllerInput(data);
    });
    ablyChannel.publish('input', { type: 'ping', player: 0 });
    console.log('[ABLY] Subscribed and ready on channel vb-' + currentRoomCode);
}

window.openControllerPanel = function () {
    if (!controllerOverlay) return;

    controllerCleanup();

    currentRoomCode = generateRoomCode();
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

    [1, 2].forEach(p => setPlayerStatus(p, '', 'P' + p + ' — Initializing...'));

    const ablyKey = document.querySelector('meta[name="ably-key"]').content;
    ablyClient = new Ably.Realtime({ key: ablyKey });

    ablyClient.connection.on('failed', (err) => {
        console.log('[ABLY] Connection FAILED:', err);
    });
    ablyClient.connection.on('disconnected', () => {
        console.log('[ABLY] Connection disconnected');
    });
    if (ablyClient.connection.state === 'connected') {
        console.log('[ABLY] Already connected — setting up channel');
        setupAblyChannel();
    } else {
        ablyClient.connection.once('connected', () => {
            console.log('[ABLY] Desktop connected to Ably');
            setupAblyChannel();
        });
    }

    controllerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log("Controller Panel Opened");
};

window.closeControllerPanel = function () {
    if (!controllerOverlay) return;
    controllerOverlay.classList.remove('active');
    document.body.style.overflow = '';

    [1, 2].forEach(p => {
        const ps = playerState[p];
        if (ps.lastInput > 0) {
            setPlayerStatus(p, 'connected', 'P' + p + ' connected');
        } else {
            setPlayerStatus(p, '', 'P' + p + ' — Waiting...');
        }
    });

    console.log("Controller Panel Closed");
};
