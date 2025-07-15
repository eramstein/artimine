import { config } from '../_config';
import type { Land, Player, UnitCardDeployed } from '../_model/model-battle';
import { bs } from '../_state';
import { damageLand } from './land';
import { damagePlayer, getOpposingPlayer } from './player';
import { damageUnit } from './unit';

export function canAttack(unit: UnitCardDeployed) {
  return !unit.exhausted && !unit.hasAttacked;
}

export function validAttackTargets(unit: UnitCardDeployed): UnitCardDeployed[] | Land | Player {
  let blockers: UnitCardDeployed[] = [];
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
  const preventedDamage = target.keywords?.armor || 0;
  const wasDestroyed = damageUnit(target, unit.power - preventedDamage);
  if (!wasDestroyed && target.keywords?.retaliate) {
    damageUnit(unit, target.keywords.retaliate);
  }
  recordUnitHasAttacked(unit);
}

export function attackLand(unit: UnitCardDeployed, target: Land) {
  if (!isValidTarget(unit, target)) {
    throw new Error('Invalid attack target');
  }
  damageLand(target, unit.power);
  recordUnitHasAttacked(unit);
}

export function attackPlayer(unit: UnitCardDeployed, playerId: number) {
  const targetPlayer = bs.players[playerId];
  if (!isValidTarget(unit, targetPlayer)) {
    throw new Error('Invalid attack target');
  }
  damagePlayer(targetPlayer, unit.power);
  recordUnitHasAttacked(unit);
}

function recordUnitHasAttacked(unit: UnitCardDeployed) {
  unit.hasAttacked = true;
  if (!unit.keywords?.moveAndAttack || unit.hasMoved) {
    unit.exhausted = true;
  }
}
