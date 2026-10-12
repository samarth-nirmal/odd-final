let modalTransitionActive = false;
let transitionTimer: ReturnType<typeof setTimeout> | null = null;

export const setModalTransitionActive = (active: boolean, durationMs = 1200): void => {
  modalTransitionActive = active;
  if (transitionTimer) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
  }
  if (active) {
    transitionTimer = setTimeout(() => {
      modalTransitionActive = false;
      transitionTimer = null;
    }, durationMs);
  }
};

export const isModalTransitionActive = (): boolean => {
  return modalTransitionActive;
};
