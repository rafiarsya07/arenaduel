import { useState, useEffect, useMemo } from 'react';
import Fighter from '../components/Fighter.jsx';
import HPBar from '../components/HPBar.jsx';
import ActionButton from '../components/ActionButton.jsx';
import RoundTimer from '../components/RoundTimer.jsx';
import FloatingDamage from '../components/FloatingDamage.jsx';

const ACTIONS = ['attack', 'defend', 'special'];

export default function GamePage({
  mySocketId,
  roomCode,
  gameState,
  phase,
  countdownInfo,
  roundInfo,
  lastResult,
  matchEnded,
  opponentLockedIn,
  opponentStatus,
  onSubmitAction,
  onLeave,
}) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [myPose, setMyPose] = useState('idle');
  const [oppPose, setOppPose] = useState('idle');
  const [showDamage, setShowDamage] = useState(false);
  const [shakeMe, setShakeMe] = useState(false);
  const [shakeOpp, setShakeOpp] = useState(false);

  const opponentId = useMemo(() => {
    if (!gameState?.players) return null;
    return Object.keys(gameState.players).find((id) => id !== mySocketId) || null;
  }, [gameState, mySocketId]);

  const me = gameState?.players?.[mySocketId];
  const opponent = opponentId ? gameState?.players?.[opponentId] : null;

  useEffect(() => {
    if (phase === 'selecting') {
      setSelectedAction(null);
      setMyPose('idle');
      setOppPose('idle');
      setShowDamage(false);
    }
  }, [phase, roundInfo?.round]);

  useEffect(() => {
    if (!lastResult || !mySocketId || !opponentId) return;

    const myAction = lastResult.actions[mySocketId];
    const oppAction = lastResult.actions[opponentId];
    const myDamage = lastResult.damage[mySocketId];
    const oppDamage = lastResult.damage[opponentId];

    setMyPose(myAction === 'attack' ? 'attack' : myAction === 'special' ? 'special' : myAction === 'defend' ? 'defend' : 'idle');
    setOppPose(oppAction === 'attack' ? 'attack' : oppAction === 'special' ? 'special' : oppAction === 'defend' ? 'defend' : 'idle');

    if (myDamage > 0) {
      setShakeMe(true);
      setTimeout(() => setShakeMe(false), 400);
    }
    if (oppDamage > 0) {
      setShakeOpp(true);
      setTimeout(() => setShakeOpp(false), 400);
    }

    setShowDamage(true);
    const timeout = setTimeout(() => setShowDamage(false), 1000);
    return () => clearTimeout(timeout);
  }, [lastResult, mySocketId, opponentId]);

  function handleSelect(action) {
    if (selectedAction || phase !== 'selecting') return;
    if (action === 'special' && (me?.cooldowns?.special || 0) > 0) return;
    setSelectedAction(action);
    onSubmitAction(action);
  }

  if (matchEnded) {
    const isWinner = matchEnded.winnerId === mySocketId;
    const isDraw = matchEnded.winnerId === 'draw';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 arena-bg">
        <div className="text-center">
          <h2
            className={`font-display font-bold text-5xl mb-3 ${
              isDraw ? 'text-gold' : isWinner ? 'text-p1' : 'text-p2'
            }`}
          >
            {isDraw ? 'DRAW' : isWinner ? 'VICTORY' : 'DEFEAT'}
          </h2>
          <p className="text-muted mb-8">
            {isDraw
              ? 'Both fighters fall together.'
              : isWinner
              ? 'You stand victorious in the arena.'
              : 'Your opponent claims this duel.'}
          </p>
          <button
            onClick={onLeave}
            className="px-8 py-3 rounded-2xl bg-p1 text-void font-display font-bold tracking-wide hover:brightness-110 transition"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col arena-bg">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4">
        <span className="font-mono text-xs text-muted">ROOM {roomCode}</span>
        <span className="font-display font-semibold text-sm text-muted">
          Round {gameState?.round || 0}
        </span>
        <button onClick={onLeave} className="text-muted text-xs underline">
          Leave
        </button>
      </div>

      {opponentStatus === 'disconnected' && (
        <div className="bg-gold/10 border-y border-gold/30 text-gold text-center text-sm py-2">
          Opponent disconnected — waiting for them to reconnect…
        </div>
      )}

      <div className="flex-1 flex items-center justify-around px-4 sm:px-16 relative">
        <div className="relative flex flex-col items-center">
          <FloatingDamage
            amount={lastResult?.damage?.[mySocketId]}
            outcome={lastResult?.outcomes?.[mySocketId]}
            visible={showDamage}
          />
          <Fighter color="#3fd0ff" glowColor="#7ce3ff" pose={myPose} facing={1} shaking={shakeMe} />
        </div>

        <div className="font-display font-bold text-3xl text-muted">VS</div>

        <div className="relative flex flex-col items-center">
          <FloatingDamage
            amount={lastResult?.damage?.[opponentId]}
            outcome={lastResult?.outcomes?.[opponentId]}
            visible={showDamage}
          />
          <Fighter color="#ff5a7a" glowColor="#ff8fa5" pose={oppPose} facing={-1} shaking={shakeOpp} />
        </div>
      </div>

      <div className="px-4 sm:px-8 flex items-center justify-between gap-6 mb-3">
        <div className="flex-1">
          <HPBar hp={me?.hp ?? 100} color="#3fd0ff" label="YOU" />
        </div>
        <div className="flex-1">
          <HPBar hp={opponent?.hp ?? 100} color="#ff5a7a" label="OPPONENT" reverse />
        </div>
      </div>

      <div className="flex items-center justify-center py-3">
        {phase === 'countdown' && countdownInfo && (
          <p className="font-display text-xl text-fg animate-pulse">Get ready…</p>
        )}
        {phase === 'selecting' && roundInfo && (
          <RoundTimer durationMs={roundInfo.durationMs} startedAt={roundInfo.startedAt} />
        )}
        {phase === 'resolving' && lastResult && (
          <p className="font-display text-base text-muted text-center px-6">
            {lastResult.description}
          </p>
        )}
      </div>

      {opponentLockedIn && phase === 'selecting' && !selectedAction && (
        <p className="text-center text-xs text-gold mb-2">Opponent has locked in their move!</p>
      )}

      <div className="px-4 sm:px-8 pb-6 sm:pb-10">
        <div className="flex gap-3 max-w-lg mx-auto">
          {ACTIONS.map((action) => (
            <ActionButton
              key={action}
              action={action}
              onClick={() => handleSelect(action)}
              disabled={phase !== 'selecting' || !!selectedAction}
              cooldown={action === 'special' ? me?.cooldowns?.special || 0 : 0}
              selected={selectedAction === action}
            />
          ))}
        </div>
        {selectedAction && phase === 'selecting' && (
          <p className="text-center text-xs text-muted mt-3">
            Waiting for opponent to choose…
          </p>
        )}
      </div>
    </div>
  );
}
