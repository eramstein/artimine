import {
  TargetType,
  type Ability,
  type ActionDefinition,
  type EffectTargets,
  type TargetDefinition,
  type UnitDeployed,
} from '../_model';
import { bs } from '../_state';
import { DataEffectTemplates } from './effects/effectTemplates';
import { checkTargets } from './target';

export function playAbility(unit: UnitDeployed, ability: Ability, targets: EffectTargets[][]) {
  console.log(
    unit.name + ' uses ability on ' + (targets && targets.map((t) => JSON.stringify(t)).join(', '))
  );

  // CHECKS + COSTS
  // ----------------------------------------------------------------------
  if (checkExhaustion(unit, ability) === false) {
    console.log('EXHAUSTED');
    return;
  }
  if (!checkMultipleEffectsTargets(unit, ability.actions, targets)) {
    console.log('INVALID TARGETS', ability.actions, targets);
    return;
  }
  if (payAbilityCost(unit, ability) === false) {
    console.log('NOT ENOUGH MANA');
    return;
  }

  // EFFECTS
  // ----------------------------------------------------------------------
  ability.actions.forEach((actionDef, actionIndex) => {
    const effectTargets = [...targets[actionIndex]];
    // If any TargetType is Self, replace the corresponding targets entry with [unit]
    if (actionDef.targets) {
      actionDef.targets.forEach((def, i) => {
        if (def.type === TargetType.Self) {
          effectTargets[i] = [unit];
        }
      });
    }
    console.log(actionDef.effect.name, actionDef.effect.args);
    DataEffectTemplates[actionDef.effect.name](actionDef.effect.args)({
      unit,
      targets: effectTargets,
      triggerParams: {},
      player: bs.players[unit.ownerPlayerId],
    });
  });
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

function checkMultipleTargets(
  unit: UnitDeployed,
  defs: TargetDefinition[],
  targets: EffectTargets[]
): boolean {
  if (!Array.isArray(targets) || targets.length !== defs.length) return false;
  for (let i = 0; i < defs.length; i++) {
    if (!checkTargets(unit, defs[i], targets[i])) return false;
  }
  return true;
}

function checkMultipleEffectsTargets(
  unit: UnitDeployed,
  actionDefs: ActionDefinition[],
  targets: EffectTargets[][]
): boolean {
  if (!Array.isArray(targets) || targets.length !== actionDefs.length) return false;
  for (let i = 0; i < actionDefs.length; i++) {
    if (!checkMultipleTargets(unit, actionDefs[i].targets || [], targets[i])) return false;
  }
  return true;
}
