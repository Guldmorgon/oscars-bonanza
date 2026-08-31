import { useState } from 'react';
import { S } from '../lib/strings';
import { BoardEditor } from './editor/BoardEditor';
import { PlayerEditor } from './editor/PlayerEditor';
import { BetRoundEditor } from './editor/BetRoundEditor';
import { FinalEditor } from './editor/FinalEditor';
import { DataEditor } from './editor/DataEditor';

type Tab = 'board' | 'players' | 'bet' | 'final' | 'data';

export function Editor() {
  const [tab, setTab] = useState<Tab>('board');

  return (
    <div className="editor">
      <div className="tabs">
        <button className={`tab${tab === 'board' ? ' active' : ''}`} onClick={() => setTab('board')}>
          {S.editor.tabBoard}
        </button>
        <button className={`tab${tab === 'players' ? ' active' : ''}`} onClick={() => setTab('players')}>
          {S.editor.tabPlayers}
        </button>
        <button className={`tab${tab === 'bet' ? ' active' : ''}`} onClick={() => setTab('bet')}>
          {S.editor.tabBet}
        </button>
        <button className={`tab${tab === 'final' ? ' active' : ''}`} onClick={() => setTab('final')}>
          {S.editor.tabFinal}
        </button>
        <button className={`tab${tab === 'data' ? ' active' : ''}`} onClick={() => setTab('data')}>
          {S.editor.tabData}
        </button>
      </div>

      {tab === 'board' && <BoardEditor />}
      {tab === 'players' && <PlayerEditor />}
      {tab === 'bet' && <BetRoundEditor />}
      {tab === 'final' && <FinalEditor />}
      {tab === 'data' && <DataEditor />}
    </div>
  );
}
