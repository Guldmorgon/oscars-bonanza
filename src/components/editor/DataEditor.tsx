import { useRef, useState } from 'react';
import { useGame, isValidSaveData } from '../../store/gameStore';
import { S } from '../../lib/strings';
import { downloadJson, readJsonFile } from '../../lib/storage';

export function DataEditor() {
  const exportData = useGame((s) => s.exportData);
  const importData = useGame((s) => s.importData);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function onExport() {
    downloadJson('oscars-stora-bonanza.json', exportData());
  }

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJsonFile<unknown>(file);
      if (!isValidSaveData(data)) throw new Error('bad');
      importData(data);
      setMsg(S.editor.importDone);
    } catch {
      setMsg(S.editor.importError);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="data-actions">
      <div className="data-row panel" style={{ padding: '1rem' }}>
        <button className="btn" onClick={onExport}>
          {S.editor.export}
        </button>
        <span className="hint">{S.editor.exportHint}</span>
      </div>
      <div className="data-row panel" style={{ padding: '1rem' }}>
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          {S.editor.import}
        </button>
        <span className="hint">{S.editor.importHint}</span>
        <input ref={fileRef} className="hidden-file" type="file" accept="application/json" onChange={onImport} />
      </div>
      {msg && <p className="hint">{msg}</p>}
    </div>
  );
}
