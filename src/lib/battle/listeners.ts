import { bs } from '@/lib/_state';
import {
  TriggerType,
  type UnitDeployed,
  type Ability,
  type Position,
  type Player,
  type Land,
  type EffectTargets,
} from '@/lib/_model';
import { getEligibleTargets } from './target';

function triggerAbilities(type: TriggerType, { ...rest }) {
  bs.units.forEach((u) => {
    u.abilities
      ?.filter((a) => checkTriggerType(a, type))
      .filter((a) => checkTriggerCondition(a, u, { ...rest }))
      .forEach((a) => {
        // TODO: if a.target, ask player or AI for targets
        // (store ability in a "pendingTriggeredAbilities" array ?)
        // console.log(u.name + ' triggers ' + a.name, a, { ...rest });
        let targets: EffectTargets = [];
        const triggerParams: any = { ...rest };
        if (a.targets) {
          targets = getEligibleTargets(u, a.targets[0]) as EffectTargets;
        }
        a.effect({
          unit: u,
          targets: [targets],
          triggerParams,
          player: bs.players[u.ownerPlayerId],
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

function checkTriggerCondition(ability: Ability, unit: UnitDeployed, triggerArgs: any): boolean {
  return !ability.trigger.condition || ability.trigger.condition(unit, triggerArgs);
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
