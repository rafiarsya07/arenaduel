import { useState } from 'react';

export default function LobbyPage({ onCreateRoom, onJoinRoom, connected, error }) {
  const [joinCode, setJoinCode] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 arena-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-wide text-fg mb-2">
            ARENA <span className="text-p1">DUEL</span>
          </h1>
          <p className="text-muted text-sm">Real-time 1v1 tactical combat</p>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <span
              className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-p1' : 'bg-danger'}`}
            />
            <span className="text-xs text-muted font-mono">
              {connected ? 'Connected to server' : 'Connecting…'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 text-danger px-4 py-2.5 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={onCreateRoom}
          disabled={!connected}
          className="w-full py-4 rounded-2xl bg-p1 text-void font-display font-bold text-lg tracking-wide disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition mb-4"
        >
          Create Room
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-line" />
          <span className="text-muted text-xs font-mono">OR</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        <div className="space-y-3">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 5))}
            placeholder="ROOM CODE"
            className="w-full bg-panel border border-line rounded-2xl px-4 py-3.5 text-center font-mono text-xl tracking-[0.3em] text-fg placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-p2/50 focus:border-p2/50 uppercase"
          />
          <button
            onClick={() => onJoinRoom(joinCode)}
            disabled={!connected || joinCode.length < 4}
            className="w-full py-4 rounded-2xl bg-panel border-2 border-p2 text-p2 font-display font-bold text-lg tracking-wide disabled:opacity-30 disabled:cursor-not-allowed hover:bg-p2/10 transition"
          >
            Join Room
          </button>
        </div>

        <p className="text-center text-muted text-xs mt-8">
          Create a room, share the code with a friend, and duel in real time.
        </p>
      </div>
    </div>
  );
}
