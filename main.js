const video = document.getElementById('mainVideo');
const loadingOverlay = document.getElementById('loadingOverlay');

function ensurePlaying() {
  if (video.paused) {
    video.play().catch((err) => {
      console.log('Autoplay blocked until interaction:', err);
    });
  }
}

// Keep stream running — no pause allowed
video.addEventListener('pause', () => {
  ensurePlaying();
});

video.addEventListener('waiting', () => {
  loadingOverlay.classList.add('active');
});

video.addEventListener('playing', () => {
  loadingOverlay.classList.remove('active');
});

video.addEventListener('canplay', () => {
  loadingOverlay.classList.remove('active');
  ensurePlaying();
});

// Block common pause shortcuts
window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.code === 'Space' || e.key.toLowerCase() === 'k') {
    e.preventDefault();
    ensurePlaying();
  }
});

// Start immediately on load
window.addEventListener('DOMContentLoaded', () => {
  video.muted = true;
  video.loop = true;
  ensurePlaying();
});

// Retry after first user gesture (browser autoplay policies)
['click', 'touchstart', 'keydown'].forEach((eventName) => {
  window.addEventListener(
    eventName,
    () => {
      ensurePlaying();
    },
    { once: true, passive: true }
  );
});
