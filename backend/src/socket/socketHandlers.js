// socketHandlers.js
import { GAME_CONFIG, GAME_PHASE } from '../game/gameRules.js';

/**
 * Wires up all Socket.IO event handlers for a single connected socket,
 * and contains the round-timer game loop logic for driving a match forward
 * through its phases (countdown -> selecting -> resolving -> next round / ended).
 */
export function registerSocketHandlers(io, socket, matchManager) {
  socket.on('create_room', () => {
    const match = matchManager.createMatch();
    const slot = match.addPlayer(socket.id);
    matchManager.linkSocketToRoom(socket.id, match.roomCode);
    socket.join(match.roomCode);

    socket.emit('room_created', { roomCode: match.roomCode, slot });
  });

  socket.on('join_room', ({ roomCode }) => {
    const match = matchManager.getMatch(roomCode || '');

    if (!match) {
      socket.emit('join_error', { message: 'Room not found.' });
      return;
    }
    if (match.isFull) {
      socket.emit('join_error', { message: 'Room is already full.' });
      return;
    }

    const slot = match.addPlayer(socket.id);
    matchManager.linkSocketToRoom(socket.id, match.roomCode);
    socket.join(match.roomCode);

    socket.emit('room_joined', { roomCode: match.roomCode, slot });
    io.to(match.roomCode).emit('opponent_found', { state: match.getPublicState() });

    startCountdown(io, matchManager, match);
  });

  socket.on('submit_action', ({ action }) => {
    const match = matchManager.getMatchBySocketId(socket.id);
    if (!match || match.phase !== GAME_PHASE.SELECTING) return;

    const roundComplete = match.submitAction(socket.id, action);

    const opponentId = match.getOpponentId(socket.id);
    if (opponentId) {
      io.to(opponentId).emit('opponent_locked_in');
    }

    if (roundComplete) {
      clearRoundTimer(match);
      resolveCurrentRound(io, matchManager, match);
    }
  });

  socket.on('leave_room', () => {
    handleDisconnectOrLeave(io, matchManager, socket.id, true);
  });

  socket.on('disconnect', () => {
    handleDisconnectOrLeave(io, matchManager, socket.id, false);
  });
}

function startCountdown(io, matchManager, match) {
  match.phase = GAME_PHASE.COUNTDOWN;
  io.to(match.roomCode).emit('countdown_start', {
    durationMs: GAME_CONFIG.countdownDurationMs,
  });

  match.timers.countdown = setTimeout(() => {
    beginRound(io, matchManager, match);
  }, GAME_CONFIG.countdownDurationMs);
}

function beginRound(io, matchManager, match) {
  match.startNewRound();

  io.to(match.roomCode).emit('round_start', {
    round: match.round,
    durationMs: GAME_CONFIG.roundDurationMs,
    state: match.getPublicState(),
  });

  match.timers.roundTimeout = setTimeout(() => {
    resolveCurrentRound(io, matchManager, match);
  }, GAME_CONFIG.roundDurationMs);
}

function clearRoundTimer(match) {
  if (match.timers.roundTimeout) {
    clearTimeout(match.timers.roundTimeout);
    delete match.timers.roundTimeout;
  }
}

function resolveCurrentRound(io, matchManager, match) {
  clearRoundTimer(match);

  if (match.phase !== GAME_PHASE.SELECTING) return;
  match.phase = GAME_PHASE.RESOLVING;

  const { roundSummary, isGameOver, winnerId } = match.resolveRound();

  io.to(match.roomCode).emit('round_result', {
    summary: roundSummary,
    state: match.getPublicState(),
  });

  if (isGameOver) {
    io.to(match.roomCode).emit('match_ended', { winnerId, state: match.getPublicState() });
    match.timers.cleanup = setTimeout(() => {
      matchManager.removeMatch(match.roomCode);
    }, 30000);
    return;
  }

  match.timers.nextRound = setTimeout(() => {
    beginRound(io, matchManager, match);
  }, GAME_CONFIG.resultDisplayMs);
}

function handleDisconnectOrLeave(io, matchManager, socketId, isVoluntaryLeave) {
  const match = matchManager.getMatchBySocketId(socketId);
  if (!match) return;

  const opponentId = match.getOpponentId(socketId);

  if (isVoluntaryLeave || match.phase === GAME_PHASE.WAITING_FOR_OPPONENT) {
    if (opponentId) {
      io.to(opponentId).emit('opponent_left');
    }
    matchManager.removeMatch(match.roomCode);
    return;
  }

  match.markDisconnected(socketId);
  if (opponentId) {
    io.to(opponentId).emit('opponent_disconnected', {
      graceMs: GAME_CONFIG.reconnectGraceMs,
    });
  }

  match.timers.disconnectGrace = setTimeout(() => {
    if (match.players[socketId] && !match.players[socketId].connected) {
      if (opponentId) io.to(opponentId).emit('opponent_left');
      matchManager.removeMatch(match.roomCode);
    }
  }, GAME_CONFIG.reconnectGraceMs);
}
