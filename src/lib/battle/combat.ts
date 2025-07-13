import { config } from '../_config';
import type { Land, Player, UnitCardDeployed } from '../_model/model-battle';
import { bs } from '../_state';
import { damageLand } from './land';
import { damagePlayer, getOpposingPlayer } from './player';
import { damageUnit } from './unit';

export function canAttack(unit: UnitCardDeployed) {
  return !unit.exhausted && !unit.hasAttacked && !unit.hasMoved;
}

export function validAttackTargets(unit: UnitCardDeployed): UnitCardDeployed[] | Land | Player {
  const firstBlocker = getClosestBlocker(unit);
  if (firstBlocker) {
    return [firstBlocker];
  }
  const opponent = getOpposingPlayer(unit);
  const landBlocker = opponent.lands.find((_, i) => i === unit.position.row);
  if (landBlocker) {
    return landBlocker;
  }
  return opponent;
}

function getClosestBlocker(unit: UnitCardDeployed): UnitCardDeployed | null {
  const blockers = bs.units.filter(
    (u) => u.ownerPlayerId !== unit.ownerPlayerId && u.position.row === unit.position.row
  );
  if (blockers.length === 0) return null;
  if (blockers.length === 1) return blockers[0];
  return unit.position.column < config.boardColumns / 2
    ? blockers.sort((a, b) => a.position.column - b.position.column)[0]
    : blockers.sort((a, b) => b.position.column - a.position.column)[0];
}

function isValidTarget(unit: UnitCardDeployed, target: UnitCardDeployed | Land | Player): boolean {
  const validTargets = validAttackTargets(unit);
  if (Array.isArray(validTargets)) {
    return validTargets.includes(target as UnitCardDeployed);
  }
  return validTargets === target;
}

export function attackUnit(unit: UnitCardDeployed, target: UnitCardDeployed) {
  if (!isValidTarget(unit, target)) {
    throw new Error('Invalid attack target');
  }
  damageUnit(target, unit.power);
  unit.hasAttacked = true;
}

export function attackLand(unit: UnitCardDeployed, target: Land) {
  if (!isValidTarget(unit, target)) {
    throw new Error('Invalid attack target');
  }
  damageLand(target, unit.power);
  unit.hasAttacked = true;
}

export function attackPlayer(unit: UnitCardDeployed, playerId: number) {
  const targetPlayer = bs.players[playerId];
  if (!isValidTarget(unit, targetPlayer)) {
    throw new Error('Invalid attack target');
  }
  damagePlayer(targetPlayer, unit.power);
  unit.hasAttacked = true;
}
