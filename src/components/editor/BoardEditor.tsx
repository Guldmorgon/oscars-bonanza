import { useRef, useState } from 'react';
import { useGame } from '../../store/gameStore';
import { S } from '../../lib/strings';
import { fileToClueImageDataUrl } from '../../lib/image';

export function BoardEditor() {
  const boards = useGame((s) => s.boards);
  const setBoardName = useGame((s) => s.setBoardName);
  const addCategory = useGame((s) => s.addCategory);
  const updateCategoryTitle = useGame((s) => s.updateCategoryTitle);
  const deleteCategory = useGame((s) => s.deleteCategory);
  const updateClue = useGame((s) => s.updateClue);

  const [boardIndex, setBoardIndex] = useState(0);
  const board = boards[boardIndex];

  return (
    <div className="center-col">
      <div className="tabs">
        <button
          className={`tab${boardIndex === 0 ? ' active' : ''}`}
          onClick={() => setBoardIndex(0)}
        >
          {S.editor.boardRound1}
        </button>
        <button
          className={`tab${boardIndex === 1 ? ' active' : ''}`}
          onClick={() => setBoardIndex(1)}
        >
          {S.editor.boardRound2}
        </button>
      </div>

      <div className="field">
        <label>{S.editor.boardName}</label>
        <input
          className="input"
          value={board.name}
          onChange={(e) => setBoardName(boardIndex, e.target.value)}
        />
      </div>

      <div className="editor-list">
        {board.categories.map((cat) => (
          <div className="panel edit-category" key={cat.id}>
            <div className="edit-cat-head">
              <input
                className="input grow"
                placeholder={S.editor.categoryTitle}
                value={cat.title}
                onChange={(e) => updateCategoryTitle(boardIndex, cat.id, e.target.value)}
              />
              <button
                className="btn btn-red"
                onClick={() => {
                  if (confirm(`${S.btn.delete}: ${cat.title || S.editor.categoryTitle}?`))
                    deleteCategory(boardIndex, cat.id);
                }}
              >
                {S.editor.deleteCategory}
              </button>
            </div>
            <div className="edit-clues">
              {cat.clues.map((clue) => (
                <ClueEditor
                  key={clue.id}
                  value={clue.value}
                  prompt={clue.prompt}
                  answer={clue.answer}
                  imageDataUrl={clue.imageDataUrl}
                  onChange={(patch) => updateClue(boardIndex, cat.id, clue.id, patch)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="btn" onClick={() => addCategory(boardIndex)}>
        + {S.editor.addCategory}
      </button>
    </div>
  );
}

function ClueEditor({
  value,
  prompt,
  answer,
  imageDataUrl,
  onChange,
}: {
  value: number;
  prompt: string;
  answer: string;
  imageDataUrl?: string;
  onChange: (patch: Partial<{ value: number; prompt: string; answer: string; imageDataUrl?: string }>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await fileToClueImageDataUrl(file);
      onChange({ imageDataUrl: url });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="edit-clue">
      <div className="edit-clue-top">
        <input
          className="input"
          type="number"
          style={{ width: '5.5rem' }}
          value={value}
          onChange={(e) => onChange({ value: Number(e.target.value) })}
        />
      </div>
      <div className="field">
        <label>{S.editor.cluePrompt}</label>
        <textarea
          className="textarea"
          value={prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
        />
      </div>
      <div className="field">
        <label>{S.editor.clueAnswer}</label>
        <input
          className="input"
          value={answer}
          onChange={(e) => onChange({ answer: e.target.value })}
        />
      </div>

      {imageDataUrl && <img className="clue-image" style={{ maxHeight: '8rem' }} src={imageDataUrl} alt="" />}
      <div className="row">
        <button className="btn btn-ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
          {S.editor.clueImage}
        </button>
        {imageDataUrl && (
          <button className="btn btn-ghost" onClick={() => onChange({ imageDataUrl: undefined })}>
            {S.editor.removeImage}
          </button>
        )}
        <input ref={fileRef} className="hidden-file" type="file" accept="image/*" onChange={onFile} />
      </div>
    </div>
  );
}
