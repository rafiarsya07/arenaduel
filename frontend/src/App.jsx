import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './hooks/useSocket.js';
import LobbyPage from './pages/LobbyPage.jsx';
import WaitingPage from './pages/WaitingPage.jsx';
import GamePage from './pages/GamePage.jsx';

const SCREEN = {
  LOBBY: 'lobby',
  WAITING: 'waiting',
  GAME: 'game',
};

export default function App() {
  const { connected, emit, on, socketId } = useSocket();

  const [screen, setScreen] = useState(SCREEN.LOBBY);
  const [roomCode, setRoomCode] = useState(null);
  const [error, setError] = useState(null);

  const [gameState, setGameState] = useState(null);
  const [phase, setPhase] = useState('waiting_for_opponent');
  const [countdownInfo, setCountdownInfo] = useState(null);
  const [roundInfo, setRoundInfo] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [matchEnded, setMatchEnded] = useState(null);
  const [opponentLockedIn, setOpponentLockedIn] = useState(false);
  const [opponentStatus, setOpponentStatus] = useState('connected');

  const resetGameState = useCallback(() => {
    setGameState(null);
    setPhase('waiting_for_opponent');
    setCountdownInfo(null);
    setRoundInfo(null);
    setLastResult(null);
    setMatchEnded(null);
    setOpponentLockedIn(false);
    setOpponentStatus('connected');
  }, []);

  useEffect(() => {
    const offCreated = on('room_created', ({ roomCode }) => {
      setRoomCode(roomCode);
      setScreen(SCREEN.WAITING);
      setError(null);
    });

    const offJoined = on('room_joined', ({ roomCode }) => {
      setRoomCode(roomCode);
      setScreen(SCREEN.GAME);
      setError(null);
    });

    const offJoinError = on('join_error', ({ message }) => {
      setError(message);
    });

    const offOpponentFound = on('opponent_found', ({ state }) => {
      setGameState(state);
      setScreen(SCREEN.GAME);
    });

    const offCountdown = on('countdown_start', ({ durationMs }) => {
      setPhase('countdown');
      setCountdownInfo({ durationMs, startedAt: Date.now() });
    });

    const offRoundStart = on('round_start', ({ round, durationMs, state }) => {
      setPhase('selecting');
      setGameState(state);
      setRoundInfo({ round, durationMs, startedAt: Date.now() });
      setOpponentLockedIn(false);
      setLastResult(null);
    });

    const offOpponentLockedIn = on('opponent_locked_in', () => {
      setOpponentLockedIn(true);
    });

    const offRoundResult = on('round_result', ({ summary, state }) => {
      setPhase('resolving');
      setGameState(state);
      setLastResult(summary);
    });

    const offMatchEnded = on('match_ended', ({ winnerId, state }) => {
      setGameState(state);
      setMatchEnded({ winnerId });
    });

    const offOpponentDisconnected = on('opponent_disconnected', () => {
      setOpponentStatus('disconnected');
    });

    const offOpponentLeft = on('opponent_left', () => {
      setError('Your opponent left the duel.');
      resetGameState();
      setScreen(SCREEN.LOBBY);
    });

    return () => {
      offCreated();
      offJoined();
      offJoinError();
      offOpponentFound();
      offCountdown();
      offRoundStart();
      offOpponentLockedIn();
      offRoundResult();
      offMatchEnded();
      offOpponentDisconnected();
      offOpponentLeft();
    };
  }, [on, resetGameState]);

  function handleCreateRoom() {
    setError(null);
    emit('create_room');
  }

  function handleJoinRoom(code) {
    if (!code || code.length < 4) return;
    setError(null);
    emit('join_room', { roomCode: code });
  }

  function handleSubmitAction(action) {
    emit('submit_action', { action });
  }

  function handleLeave() {
    emit('leave_room');
    resetGameState();
    setRoomCode(null);
    setScreen(SCREEN.LOBBY);
  }

  function handleCancelWaiting() {
    emit('leave_room');
    setRoomCode(null);
    setScreen(SCREEN.LOBBY);
  }

  if (screen === SCREEN.LOBBY) {
    return (
      <LobbyPage
        connected={connected}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        error={error}
      />
    );
  }

  if (screen === SCREEN.WAITING) {
    return <WaitingPage roomCode={roomCode} onCancel={handleCancelWaiting} />;
  }

  return (
    <GamePage
      mySocketId={socketId()}
      roomCode={roomCode}
      gameState={gameState}
      phase={phase}
      countdownInfo={countdownInfo}
      roundInfo={roundInfo}
      lastResult={lastResult}
      matchEnded={matchEnded}
      opponentLockedIn={opponentLockedIn}
      opponentStatus={opponentStatus}
      onSubmitAction={handleSubmitAction}
      onLeave={handleLeave}
    />
  );
}
