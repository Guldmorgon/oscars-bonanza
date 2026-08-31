import { useGame } from '../../store/gameStore';
import { S } from '../../lib/strings';

export function FinalEditor() {
  const questions = useGame((s) => s.final.questions);
  const addFinalQuestion = useGame((s) => s.addFinalQuestion);
  const updateFinalQuestion = useGame((s) => s.updateFinalQuestion);
  const deleteFinalQuestion = useGame((s) => s.deleteFinalQuestion);
  const addFinalAnswer = useGame((s) => s.addFinalAnswer);
  const updateFinalAnswer = useGame((s) => s.updateFinalAnswer);
  const deleteFinalAnswer = useGame((s) => s.deleteFinalAnswer);

  return (
    <div className="center-col">
      <p className="hint">{S.editor.finalIntro}</p>

      <div className="editor-list">
        {questions.map((q, i) => (
          <div className="panel edit-category" key={q.id}>
            <div className="edit-cat-head">
              <span className="value-badge">{i + 1}.</span>
              <input
                className="input grow"
                placeholder={S.editor.finalQuestionPrompt}
                value={q.prompt}
                onChange={(e) => updateFinalQuestion(q.id, e.target.value)}
              />
              <button
                className="icon-btn"
                title={S.editor.deleteFinalQuestion}
                aria-label={S.editor.deleteFinalQuestion}
                onClick={() => {
                  if (confirm(`${S.editor.deleteFinalQuestion}?`)) deleteFinalQuestion(q.id);
                }}
              >
                ✕
              </button>
            </div>

            <div className="center-col">
              {q.answers.map((a) => (
                <div className="row" key={a.id}>
                  <input
                    className="input grow"
                    placeholder={S.editor.finalAnswerText}
                    value={a.text}
                    onChange={(e) => updateFinalAnswer(q.id, a.id, { text: e.target.value })}
                  />
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={100}
                    style={{ width: '6rem' }}
                    placeholder={S.editor.finalAnswerPoints}
                    value={a.points}
                    onChange={(e) =>
                      updateFinalAnswer(q.id, a.id, { points: Number(e.target.value) })
                    }
                  />
                  <span className="hint">%</span>
                  <button
                    className="icon-btn"
                    title={S.btn.delete}
                    onClick={() => deleteFinalAnswer(q.id, a.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button className="btn btn-ghost" onClick={() => addFinalAnswer(q.id)}>
                + {S.editor.addFinalAnswer}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn" onClick={addFinalQuestion}>
        + {S.editor.addFinalQuestion}
      </button>
    </div>
  );
}
