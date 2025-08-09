import { bs } from '@/lib/_state';
import {
  TriggerType,
  type UnitDeployed,
  type Ability,
  type Position,
  type Player,
  type Land,
  type EffectTargets,
  TriggerRange,
} from '@/lib/_model';
import { getEligibleTargets } from './target';
import { DataEffectTemplates } from './effects';

function triggerAbilities(type: TriggerType, { ...rest }) {
  bs.units.forEach((u) => {
    u.abilities
      ?.filter((a) => checkTriggerType(a, type))
      .filter((a) => checkTriggerCondition(a, u, { ...rest }))
      .forEach((a) => {
        // TODO: if a.actions[0].targets, ask player or AI for targets
        // (store ability in a "pendingTriggeredAbilities" array ?)
        // console.log(u.name + ' triggers ' + a.actions[0].text, a, { ...rest });
        const triggerParams: any = { ...rest };

        // Execute each effect in the ability
        a.actions.forEach((actionDef) => {
          let targets: EffectTargets = [];
          if (actionDef.targets && actionDef.targets.length > 0) {
            targets = getEligibleTargets(u, actionDef.targets[0]) as EffectTargets;
          }
          DataEffectTemplates[actionDef.effect.name](actionDef.effect.args)({
            unit: u,
            targets: [targets],
            triggerParams,
            player: bs.players[u.ownerPlayerId],
          });
        });
      });
  });
}

function checkTriggerType(ability: Ability, triggerType: TriggerType): boolean {
  // static abilities are always re-triggering unless specified otherwise in staticRecompute
  // for permanent buffs they have to clean up and re-apply them
  return (
    (ability.trigger.type === TriggerType.Static &&
      (!ability.trigger.staticRecompute ||
        ability.trigger.staticRecompute.includes(triggerType))) ||
    ability.trigger.type === triggerType
  );
}

function checkTriggerCondition(
  ability: Ability,
  unitWithAbility: UnitDeployed,
  triggerArgs: any
): boolean {
  // if no range is specified, the trigger is always triggered
  if (!ability.trigger.range) {
    return true;
  }

  // special case for turn start, here Self means the player
  if (
    ability.trigger.type === TriggerType.OnTurnStart &&
    ability.trigger.range === TriggerRange.Self
  ) {
    return triggerArgs.player.id === unitWithAbility.ownerPlayerId;
  }

  // all others check if the unit causing the trigger is in the range
  let unitCausingTrigger = null;
  if (
    [TriggerType.OnDeath, TriggerType.OnDeploy, TriggerType.BeforeDamage].includes(
      ability.trigger.type
    )
  ) {
    unitCausingTrigger = triggerArgs.unit;
  }
  if (ability.trigger.type === TriggerType.AfterMove) {
    unitCausingTrigger = triggerArgs.mover;
  }
  if (ability.trigger.type === TriggerType.AfterCombat) {
    unitCausingTrigger = triggerArgs.attacker;
  }

  if (ability.trigger.range === TriggerRange.Self) {
    return unitWithAbility.instanceId === unitCausingTrigger.instanceId;
  }
  if (ability.trigger.range === TriggerRange.Allies) {
    return unitWithAbility.ownerPlayerId === unitCausingTrigger.ownerPlayerId;
  }
  if (ability.trigger.range === TriggerRange.Ennemies) {
    return unitWithAbility.ownerPlayerId !== unitCausingTrigger.ownerPlayerId;
  }

  return false;
}

/* 
  LISTENERS
*/
export function onDamageUnit(unit: UnitDeployed, damage: number, isCombatDamage: boolean) {
  triggerAbilities(TriggerType.BeforeDamage, { damage, isCombatDamage, unit });
}

export function onCombatResolution(attacker: UnitDeployed, defender: UnitDeployed | Land | Player) {
  triggerAbilities(TriggerType.AfterCombat, { attacker, defender });
}

export function onAfterMoveUnit(unit: UnitDeployed, pos: Position) {
  triggerAbilities(TriggerType.AfterMove, { mover: unit, pos });
}

export function onDeployUnit(unit: UnitDeployed) {
  triggerAbilities(TriggerType.OnDeploy, { unit });
}

export function onUnitDeath(unit: UnitDeployed) {
  triggerAbilities(TriggerType.OnDeath, { unit });
}

export function onTurnStart(player: Player) {
  triggerAbilities(TriggerType.OnTurnStart, { player });
}
