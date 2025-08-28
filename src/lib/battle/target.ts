import {
  isUnitCard,
  TargetType,
  type Card,
  type EffectTargets,
  type Land,
  type Position,
  type SpellCard,
  type TargetDefinition,
  type UnitDeployed,
} from '../_model';
import { bs } from '../_state';
import { getAllPositions, getEmptyCells, getPositionKey } from './boards';
import { getAllGraveyardsCards } from './graveyard';
import { getAllLands } from './land';

export function areAllTargetsValid(
  tentativeTargets: Card[] | UnitDeployed[] | Land[],
  validTargets: Card[] | UnitDeployed[] | Land[]
): boolean {
  if (validTargets === null) {
    return true;
  }
  for (let index = 0; index < tentativeTargets.length; index++) {
    const t = tentativeTargets[index];
    let found = false;
    validTargets.forEach((e) => {
      if (e.instanceId === t.instanceId) {
        found = true;
      }
    });
    return found;
  }
  return true;
}

export function areAllCellsValid(tentativeTargets: Position[], validTargets: Position[]): boolean {
  const validPositions: Record<string, Position> = {};
  validTargets.forEach((p) => {
    validPositions[getPositionKey(p)] = p;
  });
  for (let index = 0; index < tentativeTargets.length; index++) {
    if (!validPositions[getPositionKey(tentativeTargets[index])]) {
      return false;
    }
  }
  return true;
}

export function checkTargets(
  card: UnitDeployed | SpellCard,
  targetDefinition: TargetDefinition,
  tentativeTargets: EffectTargets
): boolean {
  if (!targetDefinition) {
    return true;
  }
  if (targetDefinition.count && targetDefinition.count !== tentativeTargets.length) {
    console.log('WRONG NUMBER OF TARGETS', targetDefinition, tentativeTargets);
    return false;
  }
  const eligibleTargets = getEligibleTargets(card, targetDefinition);
  // target has an instanceId
  if (
    targetDefinition.type.includes('unit') ||
    targetDefinition.type === TargetType.Land ||
    targetDefinition.type === TargetType.GraveyardCard
  ) {
    const targetsValid = areAllTargetsValid(
      tentativeTargets as Card[] | UnitDeployed[] | Land[],
      eligibleTargets as Card[] | UnitDeployed[] | Land[]
    );
    if (targetsValid === false) {
      console.log('INVALID TARGETS', targetDefinition, tentativeTargets);
      return false;
    }
    return true;
  }
  // target is cells
  if (targetDefinition.type.includes('cell')) {
    const targetsValid = areAllCellsValid(
      tentativeTargets as Position[],
      eligibleTargets as Position[]
    );
    if (targetsValid === false) {
      console.log('INVALID CELLS', targetDefinition, tentativeTargets);
      return false;
    }
    return true;
  }
  return true;
}

export function getEligibleTargets(
  card: UnitDeployed | SpellCard,
  target: TargetDefinition
): EffectTargets {
  if (!target) {
    return [];
  }
  if (isUnitCard(card) && target.type === TargetType.Self) {
    return [card];
  }
  let eligibleTargets: EffectTargets = [];
  if (target.type === TargetType.Units) {
    eligibleTargets = bs.units;
  }
  if (target.type === TargetType.Ennemies) {
    eligibleTargets = bs.units.filter((u) => u.ownerPlayerId !== card.ownerPlayerId);
  }
  if (target.type === TargetType.Allies) {
    eligibleTargets = bs.units.filter((u) => u.ownerPlayerId === card.ownerPlayerId);
  }
  if (target.type === TargetType.Cell) {
    eligibleTargets = getAllPositions();
  }
  if (target.type === TargetType.AllyCell) {
    eligibleTargets = [...getEmptyCells(true)];
  }
  if (target.type === TargetType.EnemyCell) {
    eligibleTargets = [...getEmptyCells(false)];
  }
  if (target.type === TargetType.EmptyCell) {
    eligibleTargets = [...getEmptyCells(true), ...getEmptyCells(false)];
  }
  if (target.type === TargetType.Land) {
    eligibleTargets = getAllLands();
  }
  if (target.type === TargetType.Player) {
    eligibleTargets = bs.players;
  }
  if (target.type === TargetType.GraveyardCard) {
    eligibleTargets = getAllGraveyardsCards();
  }
  return eligibleTargets;
}

export function getTargetLabel(target: TargetDefinition): string {
  const count = target.count ?? 1;
  if (target.type === TargetType.Units) {
    return `to target unit${count !== 1 ? 's' : ''}`;
  }
  if (target.type === TargetType.Ennemies) {
    return `to target ennemy${count !== 1 ? 's' : ''}`;
  }
  if (target.type === TargetType.Allies) {
    return `to target ally${count !== 1 ? 's' : ''}`;
  }
  if (target.type === TargetType.Cell) {
    return `, targets cell${count !== 1 ? 's' : ''}`;
  }
  if (target.type === TargetType.AllyCell) {
    return `, targets ally cell${count !== 1 ? 's' : ''}`;
  }
  if (target.type === TargetType.EnemyCell) {
    return `, targets enemy cell${count !== 1 ? 's' : ''}`;
  }
  if (target.type === TargetType.EmptyCell) {
    return `, targets empty cell${count !== 1 ? 's' : ''}`;
  }
  if (target.type === TargetType.Land) {
    return `to target land${count !== 1 ? 's' : ''}`;
  }
  if (target.type === TargetType.GraveyardCard) {
    return `to target graveyard card${count !== 1 ? 's' : ''}`;
  }
  if (target.type === TargetType.Player) {
    return `to target player${count !== 1 ? 's' : ''}`;
  }
  return '';
}
