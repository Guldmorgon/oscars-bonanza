import { useGame } from '../../store/gameStore';
import { S } from '../../lib/strings';

export function BetRoundEditor() {
  const betRound = useGame((s) => s.betRound);
  const setBetRound = useGame((s) => s.setBetRound);

  return (
    <div className="center-col panel" style={{ padding: '1.2rem' }}>
      <p className="hint">{S.editor.betIntro}</p>
      <div className="field">
        <label>{S.editor.betTheme}</label>
        <input
          className="input"
          value={betRound.theme}
          onChange={(e) => setBetRound({ theme: e.target.value })}
        />
      </div>
      <div className="field">
        <label>{S.editor.betQuestion}</label>
        <textarea
          className="textarea"
          value={betRound.question}
          onChange={(e) => setBetRound({ question: e.target.value })}
        />
      </div>
      <div className="field">
        <label>{S.editor.betAnswer}</label>
        <input
          className="input"
          type="number"
          style={{ maxWidth: '14rem' }}
          value={betRound.answer}
          onChange={(e) => setBetRound({ answer: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
