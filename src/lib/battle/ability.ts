import { TargetType, type Ability, type Position, type UnitDeployed } from '../_model';
import { bs } from '../_state';
import { getPossibleDeploymentPositions, isCellFree, isOnPlayersSide } from './boards';
import { isHumanPlayer } from './player';

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
  if (checkTargets(unit, ability, targets) === false) {
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

function checkTargets(
  unit: UnitDeployed,
  ability: Ability,
  targets: UnitDeployed[] | Position[]
): boolean {
  if (ability.target?.count && ability.target?.count !== targets.length) {
    console.log('WRONG NUMBER OF TARGETS', ability, targets);
    return false;
  }
  // target is units
  if (
    ability.target &&
    ability.target.type !== TargetType.EmptyCell &&
    ability.target.type !== TargetType.Self
  ) {
    const eligibleTargets = getEligibleAbilityTargets(unit, ability) as UnitDeployed[];
    const targetsValid = areAllTargetsValid(targets as UnitDeployed[], eligibleTargets);
    if (targetsValid === false) {
      console.log('INVALID TARGET', ability, targets);
      return false;
    }
    return true;
  }
  // target is cells
  if (
    ability.target &&
    [TargetType.EmptyCell, TargetType.EmptyAllyCell].indexOf(ability.target.type) >= 0
  ) {
    if (
      ability.target.type === TargetType.EmptyAllyCell &&
      !checkAllCellsValid(targets as Position[], (p) => isOnPlayersSide(p, unit.ownerPlayerId))
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

export function getEligibleAbilityTargets(
  unit: UnitDeployed,
  ability: Ability
): UnitDeployed[] | Position[] {
  const target = ability.target;
  if (!target) {
    return [];
  }
  if (target.eligible) {
    return target.eligible(unit, ability);
  }
  if (target.type === TargetType.Self) {
    return [unit];
  }
  if (target.type === TargetType.Foe) {
    return bs.units.filter((u) => u.ownerPlayerId !== unit.ownerPlayerId);
  }
  if (target.type === TargetType.Ally) {
    return bs.units.filter((u) => u.ownerPlayerId === unit.ownerPlayerId);
  }
  if (target.type === TargetType.Any) {
    return bs.units;
  }
  if (target.type === TargetType.EmptyCell) {
    return [...getPossibleDeploymentPositions(true), ...getPossibleDeploymentPositions(false)];
  }
  if (target.type === TargetType.EmptyAllyCell) {
    const isPlayer = isHumanPlayer(unit.ownerPlayerId);
    return getPossibleDeploymentPositions(isPlayer);
  }
  return [];
}

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

export function canUnitPlayAbility(unit: UnitDeployed, ability: Ability): boolean {
  const player = bs.players[unit.ownerPlayerId];
  return (
    ((player.mana || 0) >= (ability.cost || 0) || !ability.cost) &&
    (!unit.exhausted || !ability.exhausts)
  );
}
