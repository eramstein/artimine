import { isPayable, payCost } from './cost';
import type { Position, UnitCard, UnitCardDeployed } from '../_model';
import { isCellFree, isOnPlayersSide } from './boards';
import { bs } from '../_state';

export function deployUnit(unit: UnitCard, position: Position) {
  if (!isPayable(unit) || !isCellFree(position) || !isOnPlayersSide(position, unit.ownerPlayerId)) {
    return;
  }
  payCost(unit);
  bs.units.push(makeDeployedUnit(unit, position));
  console.log('deployed unit', bs.units[bs.units.length - 1]);
  bs.players[unit.ownerPlayerId].hand = bs.players[unit.ownerPlayerId].hand.filter(
    (card) => card.instanceId !== unit.instanceId
  );
}

function makeDeployedUnit(unit: UnitCard, position: Position) {
  return {
    ...unit,
    position,
    health: unit.maxHealth,
    hasAttacked: false,
    hasMoved: false,
    exhausted: !unit.keywords?.haste,
  };
}

export function isUnitActive(unit: UnitCardDeployed) {
  return !unit.exhausted;
}

export function damageUnit(unit: UnitCardDeployed, damage: number): boolean {
  unit.health -= damage;
  if (unit.health <= 0) {
    destroyUnit(unit);
    return true;
  }
  return false;
}

export function destroyUnit(unit: UnitCardDeployed) {
  bs.units = bs.units.filter((u) => u.instanceId !== unit.instanceId);
  bs.players[unit.ownerPlayerId].graveyard.push(unit);
}
