import { config } from '../_config';
import type { Land, Player, UnitDeployed } from '../_model/model-battle';
import { bs } from '../_state';
import { uiState } from '../_state/state-ui.svelte';
import { damageLand } from './land';
import { damagePlayer, getOpposingPlayer } from './player';
import { damageUnit } from './unit';
import { onCombatResolution } from './listeners';
import { soundManager } from './sound';

export function canAttack(unit: UnitDeployed) {
  return !unit.exhausted && !unit.hasAttacked;
}

export function validAttackTargets(unit: UnitDeployed): UnitDeployed[] | Land | Player {
  let blockers: UnitDeployed[] = [];
  if (unit.keywords?.ranged) {
    const unitsInRow = bs.units.filter(
      (u) => u.ownerPlayerId !== unit.ownerPlayerId && u.position.row === unit.position.row
    );
    if (unitsInRow.length > 0) {
      blockers = unitsInRow;
    }
  } else {
    const firstBlocker = getClosestBlocker(unit);
    if (firstBlocker) {
      blockers.push(firstBlocker);
    }
  }
  if (blockers.length > 0) {
    return blockers;
  }
  const opponent = getOpposingPlayer(unit);
  const landBlocker = opponent.lands.find((l) => l.position === unit.position.row);
  if (landBlocker) {
    return landBlocker;
  }
  return opponent;
}

function getClosestBlocker(unit: UnitDeployed): UnitDeployed | null {
  const blockers = bs.units.filter(
    (u) => u.ownerPlayerId !== unit.ownerPlayerId && u.position.row === unit.position.row
  );
  if (blockers.length === 0) return null;
  if (blockers.length === 1) return blockers[0];
  return unit.position.column < config.boardColumns / 2
    ? blockers.sort((a, b) => a.position.column - b.position.column)[0]
    : blockers.sort((a, b) => b.position.column - a.position.column)[0];
}

function isValidTarget(unit: UnitDeployed, target: UnitDeployed | Land | Player): boolean {
  const validTargets = validAttackTargets(unit);
  if (Array.isArray(validTargets)) {
    return validTargets.includes(target as UnitDeployed);
  }
  return validTargets === target;
}

export function attackUnit(unit: UnitDeployed, target: UnitDeployed) {
  if (!isValidTarget(unit, target)) {
    throw new Error('Invalid attack target');
  }
  const preventedDamage = target.keywords?.armor || 0;
  if (unit.keywords?.poisonous) {
    target.statuses.poison = (target.statuses.poison || 0) + unit.keywords.poisonous;
  }
  const wasDestroyed = damageUnit(target, unit.power - preventedDamage);
  if (!wasDestroyed && target.keywords?.retaliate) {
    damageUnit(unit, target.keywords.retaliate, true);
  }
  onCombatResolution(unit, target);
  recordUnitHasAttacked(unit);
}

export function attackLand(unit: UnitDeployed, target: Land) {
  if (!isValidTarget(unit, target)) {
    throw new Error('Invalid attack target');
  }
  damageLand(target, unit.power);
  onCombatResolution(unit, target);
  recordUnitHasAttacked(unit);
}

export function attackPlayer(unit: UnitDeployed, playerId: number) {
  const targetPlayer = bs.players[playerId];
  if (!isValidTarget(unit, targetPlayer)) {
    throw new Error('Invalid attack target');
  }
  damagePlayer(targetPlayer, unit.power);
  onCombatResolution(unit, targetPlayer);
  recordUnitHasAttacked(unit);
}

function recordUnitHasAttacked(unit: UnitDeployed) {
  // Update unit state
  unit.hasAttacked = true;
  if (!unit.keywords?.moveAndAttack || unit.hasMoved) {
    unit.exhausted = true;
  }
  // Play attack sound based on unit power
  soundManager.playAttackSound(unit.power);
  // Trigger attack animation
  uiState.battle.attackingUnitId = unit.instanceId;
  // Reset animation after a short delay
  setTimeout(() => {
    uiState.battle.attackingUnitId = null;
  }, 300);
}
