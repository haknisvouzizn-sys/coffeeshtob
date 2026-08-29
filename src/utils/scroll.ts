let activeAnimationId: number | null = null;

/**
 * Fast, snappy, high-performance smooth scrolling for navbar & in-page anchors.
 */
export function smoothScrollTo(elementId: string, duration = 200, offset = -75) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (activeAnimationId !== null) {
    cancelAnimationFrame(activeAnimationId);
    activeAnimationId = null;
  }

  const startY = window.scrollY || window.pageYOffset;
  const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const targetY = Math.max(0, Math.min(maxScrollY, element.getBoundingClientRect().top + startY + offset));
  const diff = targetY - startY;

  if (Math.abs(diff) < 2) return;

  let startTimestamp: number | null = null;

  // Snappy quartic ease-out for ultra-responsive navigation feel
  function easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
  }

  function step(timestamp: number) {
    if (!startTimestamp) startTimestamp = timestamp;
    const elapsed = timestamp - startTimestamp;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeOutQuart(progress);

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
