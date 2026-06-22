import { useState } from 'react';

export default function WaitingPage({ roomCode, onCancel }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 arena-bg">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-line" />
          <div className="absolute inset-0 rounded-full border-4 border-p1 border-t-transparent animate-spin" />
        </div>

        <h2 className="font-display font-bold text-2xl text-fg mb-1">Waiting for opponent</h2>
        <p className="text-muted text-sm mb-8">Share this code with a friend to start the duel</p>

        <button
          onClick={handleCopy}
          className="w-full bg-panel border-2 border-p1 rounded-2xl py-6 mb-6 hover:bg-panel2 transition"
        >
          <p className="font-mono font-bold text-4xl tracking-[0.3em] text-p1">{roomCode}</p>
          <p className="text-xs text-muted mt-2">{copied ? 'Copied!' : 'Tap to copy'}</p>
        </button>

        <button
          onClick={onCancel}
          className="text-muted text-sm underline hover:text-fg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
