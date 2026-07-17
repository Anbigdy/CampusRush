const HIGH_SCORE_KEY = 'campusRush.highScore.v1';

export function readHighScore() {
  try {
    const storedValue = window.localStorage.getItem(HIGH_SCORE_KEY);
    if (storedValue === null) {
      return 0;
    }

    const score = Number.parseInt(storedValue, 10);
    return Number.isFinite(score) && score >= 0 ? score : 0;
  } catch {
    return 0;
  }
}

export function writeHighScore(score) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;

  try {
    const currentHighScore = readHighScore();
    const nextHighScore = Math.max(currentHighScore, safeScore);
    window.localStorage.setItem(HIGH_SCORE_KEY, String(nextHighScore));
    return nextHighScore;
  } catch {
    return safeScore;
  }
}
