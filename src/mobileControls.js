const MOBILE_INPUT_EVENT = 'campus-rush:mobile-input';
const CONTROLS_VISIBILITY_EVENT = 'campus-rush:controls-visibility';

function detectMobileInput() {
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const touchScreen = navigator.maxTouchPoints > 0;
  const compactViewport = Math.min(window.innerWidth, window.innerHeight) <= 1024;
  const mobileUserAgent =
    navigator.userAgentData?.mobile === true ||
    /Android|iPhone|iPad|iPod|IEMobile|Mobile/i.test(navigator.userAgent);
  return coarsePointer || mobileUserAgent || (touchScreen && compactViewport);
}

function dispatchMobileInput(action, pressed) {
  window.dispatchEvent(
    new CustomEvent(MOBILE_INPUT_EVENT, {
      detail: { action, pressed },
    }),
  );
}

function bindControlButton(button) {
  const action = button.dataset.action;
  const activePointers = new Set();
  let lastPointerDownAt = Number.NEGATIVE_INFINITY;

  const updatePressedState = () => {
    const pressed = activePointers.size > 0;
    button.classList.toggle('is-pressed', pressed);
    button.setAttribute('aria-pressed', String(pressed));
    return pressed;
  };

  const press = (event) => {
    event.preventDefault();
    activePointers.add(event.pointerId);
    lastPointerDownAt = performance.now();
    try {
      button.setPointerCapture?.(event.pointerId);
    } catch {
      // Synthetic events and a few embedded WebViews do not expose capture.
    }
    updatePressedState();
    dispatchMobileInput(action, true);
  };

  const release = (event) => {
    if (!activePointers.has(event.pointerId)) {
      return;
    }
    event.preventDefault();
    activePointers.delete(event.pointerId);
    const stillPressed = updatePressedState();
    if (!stillPressed) {
      dispatchMobileInput(action, false);
    }
  };

  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    if (performance.now() - lastPointerDownAt < 750) {
      return;
    }
    dispatchMobileInput(action, true);
    dispatchMobileInput(action, false);
  });
  button.addEventListener('contextmenu', (event) => event.preventDefault());

  return () => {
    activePointers.clear();
    updatePressedState();
    dispatchMobileInput(action, false);
  };
}

export function setupMobileControls() {
  const controls = document.querySelector('[data-mobile-controls]');
  if (!controls) {
    return null;
  }

  const buttons = [...controls.querySelectorAll('[data-action]')];
  const resetButtons = buttons.map(bindControlButton);
  let gameplayActive = false;
  let mobileInput = detectMobileInput();

  const renderVisibility = () => {
    const visible = mobileInput && gameplayActive;
    controls.hidden = !visible;
    document.body.classList.toggle('has-mobile-controls', visible);
  };

  const updateDeviceDetection = () => {
    mobileInput = mobileInput || detectMobileInput();
    renderVisibility();
  };

  const handleVisibility = (event) => {
    gameplayActive = Boolean(event.detail?.visible);
    if (!gameplayActive) {
      resetButtons.forEach((reset) => reset());
    }
    renderVisibility();
  };

  window.addEventListener('resize', updateDeviceDetection, { passive: true });
  window.addEventListener('orientationchange', updateDeviceDetection, {
    passive: true,
  });
  window.addEventListener(CONTROLS_VISIBILITY_EVENT, handleVisibility);
  renderVisibility();

  return {
    isMobileInput: () => mobileInput,
    isVisible: () => !controls.hidden,
    setGameplayActive(visible) {
      handleVisibility({ detail: { visible } });
    },
  };
}

export { CONTROLS_VISIBILITY_EVENT, MOBILE_INPUT_EVENT };
