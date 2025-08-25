import { config } from '../_config';
import type { Land, Player, UnitDeployed } from '../_model/model-battle';
import { bs } from '../_state';
import { uiState } from '../_state/state-ui.svelte';
import { damageLand } from './land';
import { damagePlayer, getOpposingPlayer } from './player';
import { damageUnit, getAdjacentAlliesInRow, getAdjacentUnitsInColumn } from './unit';
import { onCombatResolution } from './listeners';
import { soundManager } from './sound';
import { isLand, isPlayer } from '../_model/type-lookup-battle';
import { applyTemporaryEffect } from './temporary-effects';

export function canAttack(unit: UnitDeployed) {
  return (
    !unit.exhausted &&
    !unit.hasAttacked &&
    !unit.statuses.stun &&
    !unit.statuses.mezz &&
    !unit.statuses.daze
  );
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
  useRage(unit);

  let attackedUnits = [target];
  if (unit.keywords?.cleave) {
    attackedUnits = attackedUnits.concat(getAdjacentUnitsInColumn(target));
  }
  if (unit.keywords?.lance) {
    attackedUnits = attackedUnits.concat(getAdjacentAlliesInRow(target));
  }

  attackedUnits.forEach((attackedUnit) => {
    const preventedDamage = attackedUnit.keywords?.armor || 0;
    const dealtDamage = unit.power - preventedDamage;
    const excessDamage = dealtDamage - attackedUnit.health;
    if (unit.keywords?.poisonous) {
      attackedUnit.statuses.poison = (attackedUnit.statuses.poison || 0) + unit.keywords.poisonous;
    }
    const wasDestroyed = damageUnit(attackedUnit, dealtDamage);
    if (!wasDestroyed && attackedUnit.keywords?.retaliate && !unit.keywords?.ranged) {
      damageUnit(unit, attackedUnit.keywords.retaliate, true);
    }
    if (excessDamage && unit.keywords?.trample) {
      const nextUnit = getClosestBlocker(unit);
      if (nextUnit) {
        damageUnit(nextUnit, excessDamage);
      } else {
        damageLand(bs.players[attackedUnit.ownerPlayerId].lands[unit.position.row], excessDamage);
      }
    }
  });
  onCombatResolution(unit, target);
  recordUnitHasAttacked(unit);
}

export function attackLand(unit: UnitDeployed, target: Land) {
  if (!isValidTarget(unit, target)) {
    throw new Error('Invalid attack target');
  }

  useRage(unit);
  damageLand(target, unit.power);
  const excessDamage = unit.power - target.health;
  if (excessDamage && unit.keywords?.trample) {
    damagePlayer(bs.players[target.ownerPlayerId], excessDamage);
  }
  onCombatResolution(unit, target);
  recordUnitHasAttacked(unit);
}

export function attackPlayer(unit: UnitDeployed, playerId: number) {
  const targetPlayer = bs.players[playerId];
  if (!isValidTarget(unit, targetPlayer)) {
    throw new Error('Invalid attack target');
  }

  useRage(unit);
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

export function autoAttack(unit: UnitDeployed) {
  if (!canAttack(unit)) {
    return;
  }
  const validTargets = validAttackTargets(unit);
  if (!validTargets || (Array.isArray(validTargets) && validTargets.length === 0)) return;
  if (Array.isArray(validTargets) && validTargets.length > 0) {
    attackUnit(unit, validTargets[0]);
    return;
  }
  if (isLand(validTargets)) {
    attackLand(unit, validTargets);
    return;
  }
  if (isPlayer(validTargets)) {
    attackPlayer(unit, validTargets.id);
    return;
  }
}

function useRage(unit: UnitDeployed) {
  if (unit.counters?.rage) {
    applyTemporaryEffect(unit, { power: unit.counters.rage });
    unit.counters.rage = 0;
  }
} 