import {
  isUnitCard,
  TargetType,
  type Position,
  type SpellCard,
  type Target,
  type UnitDeployed,
} from '../_model';
import { bs } from '../_state';
import { getPossibleDeploymentPositions, isCellFree, isOnPlayersSide } from './boards';
import { isHumanPlayer } from './player';

export const DataTargetTemplates: {
  [key: string]: (...any: any) => Target;
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
};

export function areAllTargetsValid(targets: UnitDeployed[], eligible: UnitDeployed[]): boolean {
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
  target: Target,
  targets: UnitDeployed[] | Position[]
): boolean {
  if (target.count && target.count !== targets.length) {
    console.log('WRONG NUMBER OF TARGETS', target, targets);
    return false;
  }
  // target is units
  if (target && target.type !== TargetType.EmptyCell && target.type !== TargetType.Self) {
    const eligibleTargets = getEligibleTargets(card, target) as UnitDeployed[];
    const targetsValid = areAllTargetsValid(targets as UnitDeployed[], eligibleTargets);
    if (targetsValid === false) {
      console.log('INVALID TARGET', target, targets);
      return false;
    }
    return true;
  }
  // target is cells
  if (target && [TargetType.EmptyCell, TargetType.EmptyAllyCell].indexOf(target.type) >= 0) {
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
  target: Target
): UnitDeployed[] | Position[] {
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
    return [...getPossibleDeploymentPositions(true), ...getPossibleDeploymentPositions(false)];
  }
  if (target.type === TargetType.EmptyAllyCell) {
    const isPlayer = isHumanPlayer(card.ownerPlayerId);
    return getPossibleDeploymentPositions(isPlayer);
  }
  return [];
}
