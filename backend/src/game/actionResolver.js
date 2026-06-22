// actionResolver.js
import { ACTIONS, DAMAGE } from './gameRules.js';

/**
 * Resolves two simultaneously-submitted actions and computes the damage
 * each player takes. This is deterministic — given the same two actions,
 * it always produces the same result — which matters for fairness and
 * for being able to unit test every matchup explicitly.
 */
export function resolveActions(action1, action2) {
  const { ATTACK, DEFEND, SPECIAL } = ACTIONS;

  const matchupKey = `${action1}_vs_${action2}`;

  const resolvers = {
    [`${ATTACK}_vs_${ATTACK}`]: () => ({
      player1Damage: DAMAGE.attackVsAttack,
      player2Damage: DAMAGE.attackVsAttack,
      player1Outcome: 'traded',
      player2Outcome: 'traded',
      description: 'Both players attack and trade blows.',
    }),

    [`${ATTACK}_vs_${DEFEND}`]: () => ({
      player1Damage: DAMAGE.attackVsDefendCounter,
      player2Damage: 0,
      player1Outcome: 'countered',
      player2Outcome: 'blocked',
      description: 'Player 2 blocks the attack and counters.',
    }),

    [`${ATTACK}_vs_${SPECIAL}`]: () => ({
      player1Damage: DAMAGE.specialDamage,
      player2Damage: DAMAGE.attackVsUndefended,
      player1Outcome: 'hit',
      player2Outcome: 'hit',
      description: 'Player 2 unleashes a Special while Player 1 attacks — both connect.',
    }),

    [`${DEFEND}_vs_${DEFEND}`]: () => ({
      player1Damage: 0,
      player2Damage: 0,
      player1Outcome: 'neutral',
      player2Outcome: 'neutral',
      description: 'Both players defend. Nothing happens.',
    }),

    [`${DEFEND}_vs_${SPECIAL}`]: () => ({
      player1Damage: DAMAGE.specialVsDefend,
      player2Damage: 0,
      player1Outcome: 'hit',
      player2Outcome: 'neutral',
      description: 'Player 1 defends but the Special still deals partial damage.',
    }),

    [`${SPECIAL}_vs_${SPECIAL}`]: () => ({
      player1Damage: DAMAGE.specialVsSpecialEach,
      player2Damage: DAMAGE.specialVsSpecialEach,
      player1Outcome: 'traded',
      player2Outcome: 'traded',
      description: 'Both players unleash their Special simultaneously.',
    }),
  };

  if (resolvers[matchupKey]) {
    return { ...resolvers[matchupKey](), action1, action2 };
  }

  const mirroredKey = `${action2}_vs_${action1}`;
  if (resolvers[mirroredKey]) {
    const mirrored = resolvers[mirroredKey]();
    return {
      player1Damage: mirrored.player2Damage,
      player2Damage: mirrored.player1Damage,
      player1Outcome: mirrored.player2Outcome,
      player2Outcome: mirrored.player1Outcome,
      description: mirrored.description,
      action1,
      action2,
    };
  }

  return {
    player1Damage: 0,
    player2Damage: 0,
    player1Outcome: 'neutral',
    player2Outcome: 'neutral',
    description: 'No valid action combination resolved.',
    action1,
    action2,
  };
}

/**
 * Returns true if an action is currently usable given cooldown state.
 */
export function isActionAvailable(action, cooldowns) {
  if (action === ACTIONS.SPECIAL) {
    return (cooldowns.special || 0) <= 0;
  }
  return true;
}

/**
 * Computes the next cooldown state after a round resolves.
 */
export function nextCooldowns(currentCooldowns, actionTaken, specialCooldownRounds) {
  const next = {
    special: Math.max(0, (currentCooldowns.special || 0) - 1),
  };

  if (actionTaken === ACTIONS.SPECIAL) {
    next.special = specialCooldownRounds;
  }

  return next;
}
