import {
  isUnitCard,
  TargetType,
  type Card,
  type EffectTargets,
  type Position,
  type SpellCard,
  type TargetDefinition,
  type UnitDeployed,
} from '../_model';
import { bs } from '../_state';
import { getEmptyCells, isCellFree, isOnPlayersSide } from './boards';
import { isHumanPlayer } from './player';
import { getAllGraveyardsCards } from './graveyard';

enum TargetTypesGroup {
  Units = 'units',
  Cells = 'cells',
  Cards = 'cards',
}

const targetTypesGroups: Record<TargetType, TargetTypesGroup> = {
  [TargetType.Self]: TargetTypesGroup.Units,
  [TargetType.Foe]: TargetTypesGroup.Units,
  [TargetType.Ally]: TargetTypesGroup.Units,
  [TargetType.Any]: TargetTypesGroup.Units,
  [TargetType.EmptyCell]: TargetTypesGroup.Cells,
  [TargetType.EmptyAllyCell]: TargetTypesGroup.Cells,
  [TargetType.GraveyardCard]: TargetTypesGroup.Cards,
};

export const DataTargetTemplates: {
  [key: string]: (...any: any) => TargetDefinition;
} = {
  ennemies: (n: number) => ({
    type: TargetType.Foe,
    count: n,
  }),
  cell: () => ({
    type: TargetType.EmptyCell,
    count: 1,
  }),
  unit: () => ({
    type: TargetType.Any,
    count: 1,
  }),
  units: (n: number) => ({
    type: TargetType.Any,
    count: n,
  }),
  allyCell: () => ({
    type: TargetType.EmptyAllyCell,
    count: 1,
  }),
  graveyardCard: () => ({
    type: TargetType.GraveyardCard,
    count: 1,
  }),
};

export function areAllTargetsValid(
  targets: UnitDeployed[] | Card[],
  eligible: UnitDeployed[] | Card[]
): boolean {
  if (eligible === null) {
    return true;
  }
  for (let index = 0; index < targets.length; index++) {
    const t = targets[index];
    let found = false;
    eligible.forEach((e) => {
      if (e.instanceId === t.instanceId) {
        found = true;
      }
    });
    return found;
  }
  return true;
}

export function checkAllCellsValid(targets: Position[], fn: (p: Position) => boolean): boolean {
  for (let index = 0; index < targets.length; index++) {
    if (fn(targets[index])) {
      return false;
    }
  }
  return true;
}

export function checkTargets(
  card: UnitDeployed | SpellCard,
  target: TargetDefinition,
  targets: EffectTargets
): boolean {
  console.log('checkTargets', target, JSON.stringify(targets));
  if (target.count && target.count !== targets.length) {
    console.log('WRONG NUMBER OF TARGETS', target, targets);
    return false;
  }
  // target is units
  if (target && targetTypesGroups[target.type] === TargetTypesGroup.Units) {
    const eligibleTargets = getEligibleTargets(card, target) as UnitDeployed[];
    const targetsValid = areAllTargetsValid(targets as UnitDeployed[], eligibleTargets);
    if (targetsValid === false) {
      console.log('INVALID TARGET UNIT', target, targets);
      return false;
    }
    return true;
  }
  // target is cards
  if (target && targetTypesGroups[target.type] === TargetTypesGroup.Cards) {
    const eligibleTargets = getEligibleTargets(card, target) as Card[];
    const targetsValid = areAllTargetsValid(targets as Card[], eligibleTargets);
    if (targetsValid === false) {
      console.log('INVALID TARGET CARD', target, targets);
      return false;
    }
    return true;
  }
  // target is cells
  if (target && isTargetCell(target.type)) {
    if (
      target.type === TargetType.EmptyAllyCell &&
      !checkAllCellsValid(targets as Position[], (p) => isOnPlayersSide(p, card.ownerPlayerId))
    ) {
      return false;
    }
    if (!checkAllCellsValid(targets as Position[], (p) => !isCellFree(p))) {
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
  if (target.eligible) {
    return target.eligible(card);
  }
  if (isUnitCard(card) && target.type === TargetType.Self) {
    return [card];
  }
  if (target.type === TargetType.Foe) {
    return bs.units.filter((u) => u.ownerPlayerId !== card.ownerPlayerId);
  }
  if (target.type === TargetType.Ally) {
    return bs.units.filter((u) => u.ownerPlayerId === card.ownerPlayerId);
  }
  if (target.type === TargetType.Any) {
    return bs.units;
  }
  if (target.type === TargetType.EmptyCell) {
    return [...getEmptyCells(true), ...getEmptyCells(false)];
  }
  if (target.type === TargetType.EmptyAllyCell) {
    const isPlayer = isHumanPlayer(card.ownerPlayerId);
    return getEmptyCells(isPlayer);
  }
  if (target.type === TargetType.GraveyardCard) {
    return getAllGraveyardsCards();
  }
  return [];
}

export function isTargetCell(targetType: TargetType): boolean {
  return targetType === TargetType.EmptyCell || targetType === TargetType.EmptyAllyCell;
}
