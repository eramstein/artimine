import {
  TriggerType,
  type Ability,
  type Card,
  type EffectTargets,
  type Land,
  type Player,
  type Position,
  type UnitDeployed,
} from '@/lib/_model';
import { bs } from '@/lib/_state';
import { activateTriggeredAbility } from '@/lib/ui/_helpers/targetting';
import { DataEffectTemplates, filterUnits } from './effects';

function triggerAbilities(type: TriggerType, { ...rest }) {
  bs.units.forEach((u) => {
    u.abilities
      ?.filter((a) => checkTriggerType(a, type))
      .filter((a) => checkTriggerCondition(a, u, { ...rest }))
      .forEach((a) => {
        const triggerParams: any = { ...rest };

        // Check if any action in the ability requires targeting
        const hasTargets = a.actions.some(
          (actionDef) => actionDef.targets && actionDef.targets.length > 0
        );

        if (hasTargets) {
          // If targeting is required, set up the UI state for user selection
          activateTriggeredAbility(u, a, triggerParams);
        } else {
          // If no targeting is required, execute immediately
          a.actions.forEach((actionDef) => {
            let targets: EffectTargets = [];
            DataEffectTemplates[actionDef.effect.name](actionDef.effect.args).fn({
              unit: u,
              targets: [targets],
              triggerParams,
              player: bs.players[u.ownerPlayerId],
            });
          });
        }
      });
  });
}

function checkTriggerType(ability: Ability, triggerType: TriggerType): boolean {
  // static abilities are always re-triggering unless specified otherwise in staticRecompute
  // for permanent buffs they have to clean up and re-apply them
  return (
    (ability.trigger.type === TriggerType.Static &&
      triggerType === TriggerType.OnDeath &&
      (!ability.trigger.staticRecompute ||
        ability.trigger.staticRecompute.includes(triggerType))) ||
    ability.trigger.type === triggerType
  );
}

// This is checking if a given ability gets triggered by trigger args
// For example, an ability with trigger type "After Moving" and range { allies: true } will trigger if the moving unit in triggerArgs is an ally
function checkTriggerCondition(
  ability: Ability,
  unitWithAbility: UnitDeployed,
  triggerArgs: any
): boolean {
  // if no range is specified, the ability is always triggered
  if (!ability.trigger.range) {
    return true;
  }

  // special case for turn start, here Self means the player
  if (
    [TriggerType.OnCardDrawn, TriggerType.OnTurnStart].includes(ability.trigger.type) &&
    ability.trigger.range.self
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
  if (
    ability.trigger.type === TriggerType.AfterMove ||
    ability.trigger.type === TriggerType.BeforeMove
  ) {
    unitCausingTrigger = triggerArgs.mover;
  }
  if (
    ability.trigger.type === TriggerType.AfterCombat ||
    ability.trigger.type === TriggerType.OnReach
  ) {
    unitCausingTrigger = triggerArgs.attacker;
  }

  const validTriggeringUnits = filterUnits({ ...ability.trigger.range, unit: unitWithAbility }).map(
    (u) => u.instanceId
  );
  return validTriggeringUnits
    ? validTriggeringUnits.includes(unitCausingTrigger.instanceId)
    : false;
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

export function onUnitReach(attacker: UnitDeployed) {
  triggerAbilities(TriggerType.OnReach, { attacker });
}

export function onAfterMoveUnit(unit: UnitDeployed, pos: Position) {
  triggerAbilities(TriggerType.AfterMove, { mover: unit, pos });
}

export function onBeforeMoveUnit(unit: UnitDeployed, pos: Position) {
  triggerAbilities(TriggerType.BeforeMove, { mover: unit, pos });
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

export function onCardDrawn(player: Player, card: Card) {
  triggerAbilities(TriggerType.OnCardDrawn, { player, card });
}
