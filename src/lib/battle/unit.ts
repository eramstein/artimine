import { isPayable, payCost } from './cost';
import type { Position, StatusType, UnitCard, UnitCardTemplate, UnitDeployed } from '../_model';
import { isCellFree, isOnPlayersSide } from './boards';
import { bs } from '../_state';
import { onDamageUnit, onDeployUnit, onUnitDeath } from './listeners';
import { soundManager } from './sound';

export function deployUnit(unit: UnitCard, position: Position) {
  // Check and pay costs
  if (!isPayable(unit) || !isCellFree(position) || !isOnPlayersSide(position, unit.ownerPlayerId)) {
    return;
  }
  payCost(unit);

  // Create and deploy unit
  bs.units.push(makeDeployedUnit(unit, position));
  bs.players[unit.ownerPlayerId].hand = bs.players[unit.ownerPlayerId].hand.filter(
    (card) => card.instanceId !== unit.instanceId
  );

  // Play deploy sound
  soundManager.playDeploySound();
  // Trigger activated abilities
  onDeployUnit(bs.units[bs.units.length - 1]);
}

export function makeUnit(leaderIndex: number, core: UnitCardTemplate): UnitCard {
  return {
    ...core,
    ownerPlayerId: leaderIndex,
    instanceId: Math.floor(Date.now() * Math.random()).toString(),
  };
}

export function summonUnit(unit: UnitCard, targetPosition: Position) {
  console.log('summonUnit', unit, targetPosition);
  const unitDeployed = makeDeployedUnit(unit, targetPosition);
  bs.units.push(unitDeployed);
}

function makeDeployedUnit(unit: UnitCard, position: Position) {
  return {
    ...unit,
    position,
    health: unit.maxHealth,
    hasAttacked: false,
    hasMoved: false,
    exhausted: !unit.keywords?.haste,
    statuses: {},
    untilEndOfTurn: {},
    staticModifiers: [],
    counters: {},
  };
}

export function isUnitActive(unit: UnitDeployed) {
  return !unit.exhausted;
}

export function damageUnit(unit: UnitDeployed, damage: number, isCombatDamage = false): boolean {
  let damageDealt = damage - (unit.keywords?.resist || 0);
  if (damageDealt < 0) {
    damageDealt = 0;
  }
  onDamageUnit(unit, damageDealt, isCombatDamage);
  unit.health -= damageDealt;
  if (unit.health <= 0) {
    destroyUnit(unit);
    return true;
  }
  return false;
}

export function healUnit(unit: UnitDeployed, amount: number) {
  unit.health += amount;
  if (unit.health > unit.maxHealth) {
    unit.health = unit.maxHealth;
  }
}

export function destroyUnit(unit: UnitDeployed) {
  bs.units = bs.units.filter((u) => u.instanceId !== unit.instanceId);
  bs.players[unit.ownerPlayerId].graveyard.push(unit);
  onUnitDeath(unit);
}

export function getAdjacentUnits(position: Position): UnitDeployed[] {
  return bs.units.filter(
    (u) =>
      (u.position.column === position.column - 1 && u.position.row === position.row) ||
      (u.position.column === position.column + 1 && u.position.row === position.row) ||
      (u.position.column === position.column && u.position.row === position.row - 1) ||
      (u.position.column === position.column && u.position.row === position.row + 1)
  );
}

export function getOwnUnits(playerId: number): UnitDeployed[] {
  return bs.units.filter((u) => u.ownerPlayerId === playerId);
}

export function getEnnemyUnits(playerId: number): UnitDeployed[] {
  return bs.units.filter((u) => u.ownerPlayerId !== playerId);
}

export function applyUnitStatus(unit: UnitDeployed, status: StatusType, duration: number) {
  if (!unit.statuses[status]) {
    unit.statuses[status] = 0;
  }
  unit.statuses[status] = (unit.statuses[status] || 0) + duration;
}
