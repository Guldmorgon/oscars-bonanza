import { useRef } from 'react';
import { useGame } from '../../store/gameStore';
import { Avatar } from '../Avatar';
import { S } from '../../lib/strings';
import { fileToAvatarDataUrl } from '../../lib/image';

export function PlayerEditor() {
  const players = useGame((s) => s.players);
  const addPlayer = useGame((s) => s.addPlayer);
  const updatePlayer = useGame((s) => s.updatePlayer);
  const deletePlayer = useGame((s) => s.deletePlayer);

  return (
    <div className="center-col">
      <div className="players-grid">
        {players.map((p) => (
          <PlayerCard
            key={p.id}
            id={p.id}
            name={p.name}
            hasPhoto={!!p.avatarDataUrl}
            player={p}
            onName={(name) => updatePlayer(p.id, { name })}
            bg={p.color}
            onPhoto={(url) => updatePlayer(p.id, { avatarDataUrl: url })}
            onDelete={() => deletePlayer(p.id)}
          />
        ))}
      </div>
      <button className="btn" onClick={addPlayer}>
        + {S.editor.addPlayer}
      </button>
    </div>
  );
}

function PlayerCard({
  name,
  hasPhoto,
  player,
  bg,
  onName,
  onPhoto,
  onDelete,
}: {
  id: string;
  name: string;
  hasPhoto: boolean;
  player: Parameters<typeof Avatar>[0]['player'];
  bg: string;
  onName: (name: string) => void;
  onPhoto: (url: string) => void;
  onDelete: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToAvatarDataUrl(file, 256, bg);
    onPhoto(url);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="panel player-card">
      <button
        onClick={() => fileRef.current?.click()}
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
        title={hasPhoto ? S.editor.changePhoto : S.editor.uploadPhoto}
      >
        <Avatar player={player} size="xl" />
      </button>
      <input
        className="input"
        placeholder={S.editor.playerName}
        value={name}
        onChange={(e) => onName(e.target.value)}
      />
      <div className="row">
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          {hasPhoto ? S.editor.changePhoto : S.editor.uploadPhoto}
        </button>
        <button
          className="icon-btn"
          title={S.btn.delete}
          aria-label={S.btn.delete}
          onClick={() => {
            if (confirm(`${S.btn.delete}: ${name}?`)) onDelete();
          }}
        >
          ✕
        </button>
      </div>
      <input ref={fileRef} className="hidden-file" type="file" accept="image/*" onChange={onFile} />
    </div>
  );
}
