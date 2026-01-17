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
const nativeVideo = document.getElementById('nativeVideo');

function openVideo(url) {
    if (!videoOverlay) return;

    videoOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scroll

    // Check if it's a direct video file (MP4)
    if (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().includes('cloudinary.com')) {
        // Use Native Video Player
        if (videoFrame) {
            videoFrame.style.display = 'none';
            videoFrame.src = '';
        }
        if (nativeVideo) {
            nativeVideo.style.display = 'block';
            nativeVideo.style.zIndex = '20'; // Force on top

            // OPTIMIZATION: Use multiple source formats for maximum browser compatibility
            // Clear any existing sources
            nativeVideo.innerHTML = '';
            nativeVideo.removeAttribute('src');
            //

            // For Cloudinary videos, create multiple source formats
            if (url.includes('cloudinary.com') && url.includes('/upload/')) {
                // WebM source (Chrome/Firefox)
                const sourceWebM = document.createElement('source');
                sourceWebM.src = url.replace('/upload/', '/upload/f_auto:video,q_auto,vc_vp9/').replace(/\.(mp4|mov)$/i, '.webm');
                sourceWebM.type = 'video/webm';

                // MP4 H.264 source (Safari/iOS)
                const sourceMP4 = document.createElement('source');
                sourceMP4.src = url.replace('/upload/', '/upload/f_auto:video,q_auto,vc_h264/').replace(/\.(webm|mov)$/i, '.mp4');
                sourceMP4.type = 'video/mp4';

                nativeVideo.appendChild(sourceWebM);
                nativeVideo.appendChild(sourceMP4);
            } else {
                // For non-Cloudinary URLs, use direct src
                nativeVideo.src = url;
            }

            nativeVideo.load(); // Reload with new sources
            nativeVideo.play().catch(e => console.log('Autoplay blocked:', e));
        }
    } else {
        // Use Iframe (YouTube/Vimeo)
        if (nativeVideo) {
            nativeVideo.style.display = 'none';
            nativeVideo.pause();
            nativeVideo.src = '';
        }
        if (videoFrame) {
            videoFrame.style.display = 'block';
            // Add autoplay parameter if not present
            const finalUrl = url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
            videoFrame.src = finalUrl;
        }
    }
}

window.closeVideoOverlay = function () {
    if (!videoOverlay) return;
    videoOverlay.classList.remove('active');

    setTimeout(() => {
        if (videoFrame) videoFrame.src = ''; // Stop iframe video
        if (nativeVideo) {
            nativeVideo.pause();
            nativeVideo.src = ''; // Stop native video
        }
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
// 6. GAME OVERLAY LOGIC
// ========================================

const gameOverlay = document.getElementById('gameOverlay');
const gameFrame = document.getElementById('gameFrame');

window.openGame = function () {
    if (!gameOverlay || !gameFrame) return;
    // Path to the game HTML. Corrected for nested structure.
    gameFrame.src = "VolleyBeach/exports/VolleyBeach/VolleyBeach.html";
    gameOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scroll
    console.log("Game Opened: VolleyBeach (Deep Path)");
};

window.closeGame = function () {
    if (!gameOverlay) return;
    gameOverlay.classList.remove('active');

    // Clear src to stop game execution and audio
    setTimeout(() => {
        if (gameFrame) gameFrame.src = "";
    }, 300);

    document.body.style.overflow = ''; // Unlock scroll
    console.log("Game Closed");
};
