// Small stable id generator used across the app.
export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// A palette of candy colors for player fallback avatars.
export const AVATAR_COLORS = [
  '#ff5fa2', // bubblegum
  '#ffb01f', // orange candy
  '#4fc3ff', // blue raspberry
  '#7cf25e', // apple
  '#b46bff', // grape
  '#ff6b5c', // cherry
  '#22d3b8', // mint
  '#ffd93d', // lemon
];

export function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
