export const RESUME_COUNTDOWN_SECONDS = 3;
export const RESUME_GO_HOLD_SECONDS = 0.35;

export function getResumeCountdownCue(remainingSeconds) {
  const countdownRemaining = Math.max(
    0,
    remainingSeconds - RESUME_GO_HOLD_SECONDS,
  );
  if (countdownRemaining <= 0) {
    return 'GO';
  }
  return String(Math.ceil(countdownRemaining));
}

export function getResumeCountdownDuration() {
  return RESUME_COUNTDOWN_SECONDS + RESUME_GO_HOLD_SECONDS;
}
