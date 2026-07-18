const loader = document.querySelector('[data-game-loader]');
const progressBar = loader?.querySelector('[data-game-loader-progress]');
const progressText = loader?.querySelector('[data-game-loader-percent]');
const statusText = loader?.querySelector('[data-game-loader-status]');
const startedAt = performance.now();
const MINIMUM_VISIBLE_MS = 550;

let hideTimer = null;
let displayedProgress = 0;

export function updateLoadingScreen(progress, status) {
  if (!loader || loader.hidden) {
    return;
  }

  const normalizedProgress = Math.min(
    1,
    Math.max(displayedProgress, progress, 0),
  );
  displayedProgress = normalizedProgress;
  const percentage = Math.round(normalizedProgress * 100);
  loader.style.setProperty('--loading-progress', `${percentage}%`);
  progressBar?.setAttribute('aria-valuenow', String(percentage));

  if (progressText) {
    progressText.textContent = `${percentage}%`;
  }
  if (statusText && status) {
    statusText.textContent = status;
  }
}

export function finishLoadingScreen() {
  if (!loader || loader.hidden || hideTimer) {
    return;
  }

  updateLoadingScreen(1, '准备出发！');
  const remainingDelay = Math.max(
    0,
    MINIMUM_VISIBLE_MS - (performance.now() - startedAt),
  );

  hideTimer = window.setTimeout(() => {
    loader.classList.add('is-complete');
    window.setTimeout(() => {
      loader.hidden = true;
    }, 360);
  }, remainingDelay);
}

updateLoadingScreen(0.12, '正在整理跑道…');
