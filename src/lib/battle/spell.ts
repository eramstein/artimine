import {
  TargetType,
  type EffectArgs,
  type Position,
  type SpellCard,
  type UnitDeployed,
} from '../_model';
import { bs } from '../_state';
import { getPossibleDeploymentPositions, isCellFree, isOnPlayersSide } from './boards';
import { isHumanPlayer } from './player';
import { isPayable } from './cost';
import { areAllTargetsValid, checkAllCellsValid } from './ability';
import { discard } from './hand';

export function getEligibleSpellTargets(spell: SpellCard): UnitDeployed[] | Position[] {
  const target = spell.target;
  if (!target) {
    return [];
  }
  if (target.type === TargetType.Foe) {
    return bs.units.filter((u) => u.ownerPlayerId !== spell.ownerPlayerId);
  }
  if (target.type === TargetType.Ally) {
    return bs.units.filter((u) => u.ownerPlayerId === spell.ownerPlayerId);
  }
  if (target.type === TargetType.Any) {
    return bs.units;
  }
  if (target.type === TargetType.EmptyCell) {
    return [...getPossibleDeploymentPositions(true), ...getPossibleDeploymentPositions(false)];
  }
  if (target.type === TargetType.EmptyAllyCell) {
    const isPlayer = isHumanPlayer(spell.ownerPlayerId);
    return getPossibleDeploymentPositions(isPlayer);
  }
  return [];
}

export function playSpell(spell: SpellCard, targets: UnitDeployed[] | Position[]) {
  console.log(spell.name + ' on ' + (targets && targets.map((t) => JSON.stringify(t)).join(', ')));

  // CHECKS + COSTS
  // ----------------------------------------------------------------------
  if (checkTargets(spell, targets) === false) {
    return;
  }
  if (!isPayable(spell) || paySpellCost(spell) === false) {
    return;
  }

  // EFFECT
  // ----------------------------------------------------------------------
  spell.effect({ targets, triggerParams: {} } as EffectArgs);

  // DISCARD
  // ----------------------------------------------------------------------
  discard(spell.instanceId, spell.ownerPlayerId);
}

function paySpellCost(spell: SpellCard): boolean {
  const player = bs.players[spell.ownerPlayerId];
  if (spell.cost) {
    if (!player.mana || player.mana < spell.cost) {
      return false;
    }
    player.mana -= spell.cost;
  }
  return true;
}

function checkTargets(spell: SpellCard, targets: UnitDeployed[] | Position[]): boolean {
  if (spell.target?.count && spell.target?.count !== targets.length) {
    console.log('WRONG NUMBER OF TARGETS', spell, targets);
    return false;
  }
  // target is units
  if (
    spell.target &&
    spell.target.type !== TargetType.EmptyCell &&
    spell.target.type !== TargetType.EmptyAllyCell
  ) {
    const eligibleTargets = getEligibleSpellTargets(spell) as UnitDeployed[];
    const targetsValid = areAllTargetsValid(targets as UnitDeployed[], eligibleTargets);
    if (targetsValid === false) {
      console.log('INVALID TARGET', spell, targets);
      return false;
    }
    return true;
  }
  // target is cells
  if (
    spell.target &&
    [TargetType.EmptyCell, TargetType.EmptyAllyCell].indexOf(spell.target.type) >= 0
  ) {
    if (
      spell.target.type === TargetType.EmptyAllyCell &&
      !checkAllCellsValid(targets as Position[], (p) => isOnPlayersSide(p, spell.ownerPlayerId))
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
