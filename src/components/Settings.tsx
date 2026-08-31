import { useGame } from '../store/gameStore';
import { S } from '../lib/strings';
import { sfx } from '../lib/sound';
import { music } from '../lib/music';

export function Settings() {
  const soundOn = useGame((s) => s.settings.soundOn);
  const setSound = useGame((s) => s.setSound);
  const musicOn = useGame((s) => s.settings.musicOn);
  const setMusic = useGame((s) => s.setMusic);
  const resetGame = useGame((s) => s.resetGame);
  const reseed = useGame((s) => s.reseed);

  return (
    <div className="settings">
      <div className="panel setting-row">
        <span style={{ fontWeight: 800 }}>{S.settings.sound}</span>
        <div className="toggle">
          <button
            className={soundOn ? 'on' : ''}
            onClick={() => {
              setSound(true);
              sfx.click();
            }}
          >
            {S.settings.soundOn}
          </button>
          <button className={!soundOn ? 'off-active' : ''} onClick={() => setSound(false)}>
            {S.settings.soundOff}
          </button>
        </div>
      </div>

      <div className="panel setting-row">
        <div>
          <div style={{ fontWeight: 800 }}>{S.settings.music}</div>
          <div className="hint">{S.settings.musicHint}</div>
        </div>
        <div className="toggle">
          <button
            className={musicOn ? 'on' : ''}
            onClick={() => {
              setMusic(true);
              music.setEnabled(true);
            }}
          >
            {S.settings.soundOn}
          </button>
          <button
            className={!musicOn ? 'off-active' : ''}
            onClick={() => {
              setMusic(false);
              music.setEnabled(false);
            }}
          >
            {S.settings.soundOff}
          </button>
        </div>
      </div>

      <div className="panel setting-row">
        <div>
          <div style={{ fontWeight: 800 }}>{S.settings.resetGame}</div>
          <div className="hint">{S.settings.resetGameHint}</div>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => {
            if (confirm(S.settings.resetGameConfirm)) resetGame();
          }}
        >
          {S.settings.resetGame}
        </button>
      </div>

      <div className="panel setting-row">
        <div>
          <div style={{ fontWeight: 800 }}>{S.settings.reseed}</div>
          <div className="hint">{S.settings.reseedHint}</div>
        </div>
        <button
          className="btn btn-red"
          onClick={() => {
            if (confirm(S.settings.reseedConfirm)) reseed();
          }}
        >
          {S.settings.reseed}
        </button>
      </div>
    </div>
  );
}
