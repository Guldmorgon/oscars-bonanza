// Thin wrapper over canvas-confetti with a few candy-colored presets.
import confetti from 'canvas-confetti';

const CANDY = ['#e2b558', '#fff3d6', '#f6dc9b', '#8b34f5', '#5d16bd', '#a9791f'];

/** A cheerful burst from the center — used on a correct answer. */
export function burst() {
  confetti({
    particleCount: 120,
    spread: 75,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors: CANDY,
    scalar: 1.1,
  });
}

/** Two side cannons — bigger celebration for wins. */
export function cannons() {
  const opts = { particleCount: 80, spread: 60, colors: CANDY, scalar: 1.2 };
  confetti({ ...opts, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...opts, angle: 120, origin: { x: 1, y: 0.7 } });
}

/** A sustained shower — the grand finale winner celebration. */
export function celebrate() {
  const end = Date.now() + 2500;
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors: CANDY });
    confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors: CANDY });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 160, spread: 100, startVelocity: 50, origin: { y: 0.5 }, colors: CANDY });
}
