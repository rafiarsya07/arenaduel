// MatchManager.js
import { Match } from './Match.js';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/I/1 to avoid ambiguity

function generateRoomCode(length = 5) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

/**
 * Holds all currently active matches in memory, keyed by room code.
 * Nothing here is persisted — if the server restarts, all in-progress
 * matches are gone. This is an intentional design choice for this project:
 * no database, no accounts, just ephemeral real-time sessions.
 */
export class MatchManager {
  constructor() {
    this.matchesByRoomCode = new Map();
    this.roomCodeBySocketId = new Map();
  }

  createMatch() {
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (this.matchesByRoomCode.has(roomCode));

    const match = new Match(roomCode);
    this.matchesByRoomCode.set(roomCode, match);
    return match;
  }

  getMatch(roomCode) {
    return this.matchesByRoomCode.get(roomCode.toUpperCase());
  }

  getMatchBySocketId(socketId) {
    const roomCode = this.roomCodeBySocketId.get(socketId);
    if (!roomCode) return null;
    return this.matchesByRoomCode.get(roomCode);
  }

  linkSocketToRoom(socketId, roomCode) {
    this.roomCodeBySocketId.set(socketId, roomCode);
  }

  removeMatch(roomCode) {
    const match = this.matchesByRoomCode.get(roomCode);
    if (match) {
      match.clearTimers();
      match.playerIds.forEach((id) => this.roomCodeBySocketId.delete(id));
      this.matchesByRoomCode.delete(roomCode);
    }
  }

  get activeMatchCount() {
    return this.matchesByRoomCode.size;
  }
}
