// Initialize Lucide Icons
if (window.lucide) {
  window.lucide.createIcons();
}

// Elements
const container = document.getElementById('videoContainer');
const video = document.getElementById('mainVideo');

const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeSliderCurrent = document.getElementById('volumeSliderCurrent');
const volumeIcon = document.getElementById('volumeIcon');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const controlsOverlay = document.getElementById('controlsOverlay');

const loadingOverlay = document.getElementById('loadingOverlay');
const dropOverlay = document.getElementById('dropOverlay');



// State variables
let isVolumeDragging = false;
let controlsTimeout = null;
let lastVolume = 1.0;
let isReplaying = false;



// Format file size
function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Update Icon Helper (Lucide re-renders)
function updateIcon(element, iconName) {
  element.setAttribute('data-lucide', iconName);
  if (window.lucide) {
    window.lucide.createIcons();
  }
}







// 4. Volume Controls
function updateVolumeSlider(vol) {
  const volumePercentage = vol * 100;
  volumeSliderCurrent.style.width = `${volumePercentage}%`;
  video.volume = vol;
  video.muted = vol === 0;

  if (video.muted || vol === 0) {
    updateIcon(volumeIcon, 'volume-x');
  } else if (vol < 0.4) {
    updateIcon(volumeIcon, 'volume');
  } else if (vol < 0.7) {
    updateIcon(volumeIcon, 'volume-1');
  } else {
    updateIcon(volumeIcon, 'volume-2');
  }
}

function handleVolumeChange(e) {
  const rect = volumeSlider.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  let vol = clickX / width;
  if (vol < 0) vol = 0;
  if (vol > 1) vol = 1;
  lastVolume = vol > 0 ? vol : lastVolume;
  updateVolumeSlider(vol);
}

volumeSlider.addEventListener('mousedown', (e) => {
  isVolumeDragging = true;
  handleVolumeChange(e);
});

window.addEventListener('mousemove', (e) => {
  if (isVolumeDragging) {
    handleVolumeChange(e);
  }
});

window.addEventListener('mouseup', () => {
  if (isVolumeDragging) {
    isVolumeDragging = false;
  }
});

muteBtn.addEventListener('click', () => {
  if (video.muted || video.volume === 0) {
    video.muted = false;
    updateVolumeSlider(lastVolume > 0 ? lastVolume : 0.8);
  } else {
    lastVolume = video.volume;
    updateVolumeSlider(0);
  }
});

// Initialize volume to 100%
updateVolumeSlider(1.0);

// 5. Fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);
video.addEventListener('dblclick', toggleFullscreen);

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

function handleFullscreenChange() {
  const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
  if (isFullscreen) {
    fullscreenBtn.querySelector('.btn-icon-expand').classList.add('hidden');
    fullscreenBtn.querySelector('.btn-icon-shrink').classList.remove('hidden');
  } else {
    fullscreenBtn.querySelector('.btn-icon-expand').classList.remove('hidden');
    fullscreenBtn.querySelector('.btn-icon-shrink').classList.add('hidden');
  }
}





// 8. Auto Hide Controls
function showControls() {
  controlsOverlay.classList.remove('hide-controls');
  container.classList.remove('hide-controls-cursor');
  clearTimeout(controlsTimeout);
}

function autoHideControls() {
  clearTimeout(controlsTimeout);
  if (!video.paused) {
    controlsTimeout = setTimeout(() => {
      controlsOverlay.classList.add('hide-controls');
      container.classList.add('hide-controls-cursor');
    }, 2500);
  }
}

container.addEventListener('mousemove', () => {
  showControls();
  autoHideControls();
});

container.addEventListener('mouseleave', () => {
  if (!video.paused) {
    controlsOverlay.classList.add('hide-controls');
    container.classList.add('hide-controls-cursor');
  }
});

// Prevent hiding when hovering controls content
controlsOverlay.addEventListener('mousemove', (e) => {
  e.stopPropagation();
  showControls();
});





// 10. Buffering & Replay Indicators
video.addEventListener('waiting', () => {
  if (!isReplaying) {
    loadingOverlay.classList.add('active');
  }
});

video.addEventListener('playing', () => {
  if (!isReplaying) {
    loadingOverlay.classList.remove('active');
  }
});

video.addEventListener('canplay', () => {
  if (!isReplaying) {
    loadingOverlay.classList.remove('active');
  }
});

// Custom Ended / Seamless Replay Transition
video.addEventListener('ended', () => {
  isReplaying = true;
  loadingOverlay.classList.add('active');
  
  setTimeout(() => {
    video.currentTime = 0;
    video.play().then(() => {
      // Keep loading overlay active during initial playback frames to mask the seek
      setTimeout(() => {
        loadingOverlay.classList.remove('active');
        isReplaying = false;
      }, 1000);
    }).catch(err => {
      console.log("Seamless Replay failed: ", err);
      loadingOverlay.classList.remove('active');
      isReplaying = false;
    });
  }, 400); // 300ms loading overlay fade-in transition + 100ms buffer
});

// 11. Drag & Drop Support
window.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropOverlay.classList.add('active');
});

dropOverlay.addEventListener('dragleave', () => {
  dropOverlay.classList.remove('active');
});

window.addEventListener('drop', (e) => {
  e.preventDefault();
  dropOverlay.classList.remove('active');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('video/')) {
      const objectURL = URL.createObjectURL(file);
      video.src = objectURL;
      

      
      // Start playing
      video.play().catch(err => console.log("Play failed on drop: ", err));
    } else {
      alert('Unsupported file format. Please drop a valid video file.');
    }
  }
});

// 12. Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  // Ignore shortcuts if focusing a text input
  if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
    return;
  }

  const key = e.key.toLowerCase();

  switch(key) {
    case 'f':
      e.preventDefault();
      toggleFullscreen();
      break;
    case 'm':
      e.preventDefault();
      muteBtn.click();
      break;
    case 'arrowup':
      e.preventDefault();
      const volUp = Math.min(1.0, video.volume + 0.05);
      updateVolumeSlider(volUp);
      lastVolume = volUp;
      break;
    case 'arrowdown':
      e.preventDefault();
      const volDown = Math.max(0.0, video.volume - 0.05);
      updateVolumeSlider(volDown);
      lastVolume = volDown;
      break;
  }
});

// Ensure autoplay on load
window.addEventListener('DOMContentLoaded', () => {
  video.play().catch(err => {
    console.log("Autoplay waiting for user interaction: ", err);
  });
});
