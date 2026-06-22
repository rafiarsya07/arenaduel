// gameRules.js
// Central source of truth for all game balance numbers and rules.
// Keeping these in one place makes the system easy to tune and reason about.

export const GAME_CONFIG = {
  startingHp: 100,
  roundDurationMs: 5000, // how long players have to choose an action each round
  countdownDurationMs: 3000, // pre-game countdown before round 1
  resultDisplayMs: 2200, // how long the resolution result is shown before next round
  reconnectGraceMs: 15000, // how long a disconnected player's slot is held open
  specialCooldownRounds: 3, // rounds before Special can be used again after use
  maxRounds: 30, // safety cap to guarantee a game always ends
};

export const ACTIONS = {
  ATTACK: 'attack',
  DEFEND: 'defend',
  SPECIAL: 'special',
};

export const DAMAGE = {
  attackVsUndefended: 18, // Attack lands cleanly
  attackVsAttack: 12, // both players trade blows
  attackVsDefendCounter: 6, // attacker takes small counter damage for attacking a defender
  specialDamage: 30,
  specialVsSpecialEach: 15, // if both use Special simultaneously, both take reduced damage
  specialVsDefend: 10, // Defend reduces Special's damage but doesn't fully block it
};

export const GAME_PHASE = {
  WAITING_FOR_OPPONENT: 'waiting_for_opponent',
  COUNTDOWN: 'countdown',
  SELECTING: 'selecting',
  RESOLVING: 'resolving',
  ENDED: 'ended',
};
