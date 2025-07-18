import { TargetType, type Ability, type Position, type UnitDeployed } from '../_model';
import { bs } from '../_state';
import { getPossibleDeploymentPositions, isCellFree, isOnPlayersSide } from './boards';
import { isHumanPlayer } from './player';
import { areAllTargetsValid, checkAllCellsValid, checkTargets } from './target';

export function playAbility(
  unit: UnitDeployed,
  ability: Ability,
  targets: UnitDeployed[] | Position[]
) {
  console.log(
    unit.name +
      ' uses ' +
      ability.name +
      ' on ' +
      (targets && targets.map((t) => JSON.stringify(t)).join(', '))
  );

  // CHECKS + COSTS
  // ----------------------------------------------------------------------
  if (checkExhaustion(unit, ability) === false) {
    return;
  }
  if (ability.target && checkTargets(unit, ability.target, targets) === false) {
    console.log('INVALID TARGET', ability.target, targets);
    return;
  }
  if (payAbilityCost(unit, ability) === false) {
    return;
  }
  if (ability.target && ability.target.type === TargetType.Self) {
    targets = [unit];
  }

  // EFFECT
  // ----------------------------------------------------------------------
  ability.effect({ unit, targets, triggerParams: {} });
}

function checkExhaustion(unit: UnitDeployed, ability: Ability): boolean {
  if (unit.exhausted && ability.exhausts) {
    return false;
  }
  if (ability.exhausts) {
    if (unit.exhausted) {
      return false;
    }
    unit.exhausted = true;
  }
  return true;
}

function payAbilityCost(unit: UnitDeployed, ability: Ability): boolean {
  const player = bs.players[unit.ownerPlayerId];
  if (ability.cost) {
    if (!player.mana || player.mana < ability.cost) {
      return false;
    }
    player.mana -= ability.cost;
  }
  return true;
}

export function canUnitPlayAbility(unit: UnitDeployed, ability: Ability): boolean {
  const player = bs.players[unit.ownerPlayerId];
  return (
    ((player.mana || 0) >= (ability.cost || 0) || !ability.cost) &&
    (!unit.exhausted || !ability.exhausts)
  );
}
