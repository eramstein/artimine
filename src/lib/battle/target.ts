import {
  CardType,
  isUnitCard,
  TargetType,
  type Card,
  type EffectTargets,
  type Position,
  type SpellCard,
  type TargetDefinition,
  type UnitDeployed,
  type Land,
} from '../_model';
import { bs } from '../_state';
import { getEmptyCells, getPositionKey, isCellFree, isOnPlayersSide } from './boards';
import { getAllGraveyardsCards } from './graveyard';
import { getAllLands } from './land';

type TargetTemplateFunctions = {
  self: () => TargetDefinition;
  ennemies: (n: number) => TargetDefinition;
  allies: (n: number) => TargetDefinition;
  cell: () => TargetDefinition;
  unit: () => TargetDefinition;
  units: (n: number) => TargetDefinition;
  allyCell: () => TargetDefinition;
  emptyCell: () => TargetDefinition;
  graveyardCard: () => TargetDefinition;
  graveyardUnit: () => TargetDefinition;
};

export const DataTargetTemplates: TargetTemplateFunctions = {
  self: () => ({
    type: TargetType.Self,
  }),
  ennemies: (n: number) => ({
    type: TargetType.Unit,
    count: n,
    eligible: (card: Card, units: EffectTargets) => {
      return (units as UnitDeployed[]).filter((t) => t.ownerPlayerId !== card.ownerPlayerId);
    },
    text: `${n} ennemy units`,
  }),
  allies: (n: number) => ({
    type: TargetType.Unit,
    count: n,
    eligible: (card: Card, units: EffectTargets) => {
      return (units as UnitDeployed[]).filter((t) => t.ownerPlayerId === card.ownerPlayerId);
    },
    text: `${n} allied units`,
  }),
  cell: () => ({
    type: TargetType.Cell,
    count: 1,
    text: `1 cell`,
  }),
  unit: () => ({
    type: TargetType.Unit,
    count: 1,
    text: `1 unit`,
  }),
  units: (n: number) => ({
    type: TargetType.Unit,
    count: n,
    text: `${n} units`,
  }),
  allyCell: () => ({
    type: TargetType.Cell,
    count: 1,
    eligible: (card: Card, positions: EffectTargets) => {
      return (positions as Position[]).filter(
        (p) => isOnPlayersSide(p, card.ownerPlayerId) && isCellFree(p)
      );
    },
    text: `1 empty allied cell`,
  }),
  emptyCell: () => ({
    type: TargetType.Cell,
    count: 1,
    eligible: (card: Card, positions: EffectTargets) => {
      return (positions as Position[]).filter((p) => isCellFree(p));
    },
    text: `1 empty cell`,
  }),
  graveyardCard: () => ({
    type: TargetType.GraveyardCard,
    count: 1,
    text: `1 card from graveyard`,
  }),
  graveyardUnit: () => ({
    type: TargetType.GraveyardCard,
    count: 1,
    eligible: (card: Card, graveyardCards: EffectTargets) => {
      return (graveyardCards as Card[]).filter((c) => c.type === CardType.Unit);
    },
    text: `1 unit from graveyard`,
  }),
};

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
    targetDefinition.type === TargetType.Unit ||
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
  if (targetDefinition.type === TargetType.Cell) {
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
  if (target.type === TargetType.Unit) {
    eligibleTargets = bs.units;
  }
  if (target.type === TargetType.Cell) {
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
  if (target.eligible) {
    return target.eligible(card, eligibleTargets);
  }
  return eligibleTargets;
}
