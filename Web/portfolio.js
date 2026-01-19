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
