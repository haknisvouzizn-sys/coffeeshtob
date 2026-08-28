let activeAnimationId: number | null = null;

export function smoothScrollTo(elementId: string, duration = 500, offset = -80) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (activeAnimationId !== null) {
    cancelAnimationFrame(activeAnimationId);
    activeAnimationId = null;
  }

  const startY = window.scrollY || window.pageYOffset;
  const targetY = Math.max(0, element.getBoundingClientRect().top + startY + offset);
  const diff = targetY - startY;

  if (Math.abs(diff) < 2) return;

  let startTimestamp: number | null = null;

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp: number) {
    if (!startTimestamp) startTimestamp = timestamp;
    const elapsed = timestamp - startTimestamp;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo({
      top: startY + diff * ease,
      behavior: 'auto'
    });

    if (progress < 1) {
      activeAnimationId = window.requestAnimationFrame(step);
    } else {
      activeAnimationId = null;
    }
  }

  activeAnimationId = window.requestAnimationFrame(step);
}

