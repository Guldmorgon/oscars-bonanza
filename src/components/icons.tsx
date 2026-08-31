// Small inline SVG icons in the gold palette (no emoji).

export function Trophy({ size = 92 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id="obb-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8e2" />
          <stop offset="42%" stopColor="#f3d491" />
          <stop offset="70%" stopColor="#e2b558" />
          <stop offset="100%" stopColor="#a9791f" />
        </linearGradient>
      </defs>
      <g fill="url(#obb-gold)">
        {/* cup */}
        <path d="M20 8h24v14a12 12 0 0 1-24 0V8Z" />
        {/* handles */}
        <path d="M20 11h-6a8 8 0 0 0 8 12v-4a4 4 0 0 1-4-4v-1h2v-3Zm24 0h6a8 8 0 0 1-8 12v-4a4 4 0 0 0 4-4v-1h-2v-3Z" />
        {/* stem + base */}
        <path d="M29 33h6v9h-6zM22 42h20v5H22zM18 49h28v6H18z" />
      </g>
    </svg>
  );
}
