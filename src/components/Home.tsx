import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { S } from '../lib/strings';
import { sfx, unlockAudio } from '../lib/sound';
import { music } from '../lib/music';
import type { View } from '../App';

export function Home({ go }: { go: (v: View) => void }) {
  const playerCount = useGame((s) => s.players.length);

  function nav(v: View) {
    unlockAudio();
    void music.startBackground();
    sfx.click();
    go(v);
  }

  return (
    <div className="home">
      <motion.h1
        className="home-logo title-gradient"
        initial={{ scale: 0.7, opacity: 0, rotate: -3 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      >
        {S.appName}
      </motion.h1>
      <p className="home-tagline">{S.tagline}</p>

      <div className="home-menu">
        <button className="btn btn-lg" onClick={() => nav('play')}>
          {S.menu.play}
        </button>
        <button className="btn btn-ghost btn-lg" onClick={() => nav('edit')}>
          {S.menu.edit}
        </button>
        <button className="btn btn-ghost" onClick={() => nav('settings')}>
          {S.menu.settings}
        </button>
      </div>

      <p className="home-info">
        {S.menu.rounds} ·{' '}
        {playerCount ? S.menu.players(playerCount) : S.menu.noPlayers}
        <br />
        {S.menu.startHint}
      </p>
    </div>
  );
}
