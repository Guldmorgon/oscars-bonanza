import type { Player } from '../types';

export function Avatar({ player, size = '' }: { player: Player; size?: 'lg' | 'xl' | '' }) {
  const cls = `avatar${size ? ' ' + size : ''}`;
  if (player.avatarDataUrl) {
    return <img className={cls} src={player.avatarDataUrl} alt={player.name} />;
  }
  const initial = player.name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span className={cls} style={{ background: player.color }} aria-label={player.name}>
      {initial}
    </span>
  );
}
