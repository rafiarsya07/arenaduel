// Match.js
import { GAME_CONFIG, GAME_PHASE, ACTIONS } from './gameRules.js';
import { resolveActions, isActionAvailable, nextCooldowns } from './actionResolver.js';

let matchIdCounter = 1;

/**
 * Represents a single 1v1 match. This class is the "single source of truth"
 * for game state — clients never decide outcomes themselves, they only
 * submit intents (chosen actions) and receive authoritative results back.
 * This server-authoritative design is what prevents a malicious client from
 * just claiming a win.
 */
export class Match {
  constructor(roomCode) {
    this.id = matchIdCounter++;
    this.roomCode = roomCode;
    this.phase = GAME_PHASE.WAITING_FOR_OPPONENT;
    this.round = 0;
    this.players = {}; // socketId -> { slot, hp, cooldowns, connected, disconnectedAt }
    this.pendingActions = {}; // socketId -> action, cleared each round
    this.timers = {};
    this.createdAt = Date.now();
  }

  get playerIds() {
    return Object.keys(this.players);
  }

  get isFull() {
    return this.playerIds.length === 2;
  }

  addPlayer(socketId) {
    const slot = this.playerIds.length === 0 ? 1 : 2;
    this.players[socketId] = {
      slot,
      hp: GAME_CONFIG.startingHp,
      cooldowns: { special: 0 },
      connected: true,
      disconnectedAt: null,
    };
    return slot;
  }

  getOpponentId(socketId) {
    return this.playerIds.find((id) => id !== socketId) || null;
  }

  markDisconnected(socketId) {
    if (this.players[socketId]) {
      this.players[socketId].connected = false;
      this.players[socketId].disconnectedAt = Date.now();
    }
  }

  markReconnected(socketId) {
    if (this.players[socketId]) {
      this.players[socketId].connected = true;
      this.players[socketId].disconnectedAt = null;
    }
  }

  get bothConnected() {
    return this.playerIds.every((id) => this.players[id].connected);
  }

  /**
   * Records a player's chosen action for the current round.
   * Returns true if this submission completes the round (both players have
   * now acted), which signals the caller to trigger resolution immediately
   * rather than waiting for the round timer to expire.
   */
  submitAction(socketId, action) {
    if (this.phase !== GAME_PHASE.SELECTING) return false;
    if (!this.players[socketId]) return false;
    if (this.pendingActions[socketId]) return false;

    const player = this.players[socketId];
    if (!isActionAvailable(action, player.cooldowns)) return false;

    this.pendingActions[socketId] = action;
    return this.playerIds.every((id) => this.pendingActions[id]);
  }

  /**
   * Resolves the current round: fills in a default action ("defend") for
   * any player who didn't submit in time, runs the resolver, applies
   * damage, updates cooldowns, and determines if the match has ended.
   */
  resolveRound() {
    const [idA, idB] = this.playerIds;

    const actionA = this.pendingActions[idA] || ACTIONS.DEFEND;
    const actionB = this.pendingActions[idB] || ACTIONS.DEFEND;

    const result = resolveActions(actionA, actionB);

    const playerA = this.players[idA];
    const playerB = this.players[idB];

    playerA.hp = Math.max(0, playerA.hp - result.player1Damage);
    playerB.hp = Math.max(0, playerB.hp - result.player2Damage);

    playerA.cooldowns = nextCooldowns(playerA.cooldowns, actionA, GAME_CONFIG.specialCooldownRounds);
    playerB.cooldowns = nextCooldowns(playerB.cooldowns, actionB, GAME_CONFIG.specialCooldownRounds);

    const roundSummary = {
      round: this.round,
      actions: { [idA]: actionA, [idB]: actionB },
      damage: { [idA]: result.player1Damage, [idB]: result.player2Damage },
      outcomes: { [idA]: result.player1Outcome, [idB]: result.player2Outcome },
      description: result.description,
      hpAfter: { [idA]: playerA.hp, [idB]: playerB.hp },
    };

    this.pendingActions = {};

    const isGameOver =
      playerA.hp <= 0 || playerB.hp <= 0 || this.round >= GAME_CONFIG.maxRounds;

    let winnerId = null;
    if (isGameOver) {
      if (playerA.hp <= 0 && playerB.hp <= 0) {
        winnerId = 'draw';
      } else if (playerA.hp <= 0) {
        winnerId = idB;
      } else if (playerB.hp <= 0) {
        winnerId = idA;
      } else {
        winnerId = playerA.hp === playerB.hp ? 'draw' : playerA.hp > playerB.hp ? idA : idB;
      }
      this.phase = GAME_PHASE.ENDED;
    }

    return { roundSummary, isGameOver, winnerId };
  }

  startNewRound() {
    this.round += 1;
    this.pendingActions = {};
    this.phase = GAME_PHASE.SELECTING;
  }

  getPublicState() {
    return {
      roomCode: this.roomCode,
      phase: this.phase,
      round: this.round,
      players: Object.fromEntries(
        this.playerIds.map((id) => [
          id,
          {
            slot: this.players[id].slot,
            hp: this.players[id].hp,
            cooldowns: this.players[id].cooldowns,
            connected: this.players[id].connected,
          },
        ])
      ),
    };
  }

  clearTimers() {
    Object.values(this.timers).forEach(clearTimeout);
    this.timers = {};
  }
}
