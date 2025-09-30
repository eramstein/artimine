import { TriggerType, type SpellCard, type UnitDeployed } from '@/lib/_model';
import { bs } from '@/lib/_state';
import { getBudgetForUnit } from '@/tools/generator/budgets';

export function valueUnit(unit: UnitDeployed) {
  const baseValue = getBudgetForUnit(unit.cost, unit.colors);
  // damaged units are worth less
  const damageDiscount = (unit.maxHealth - unit.health) / (unit.maxHealth || 1) < 0.5 ? 0.5 : 1;
  // units which already used onDeploy effects are worth less
  const onDeployDiscount = unit.abilities?.some(
    (ability) => ability.trigger.type === TriggerType.OnDeploy
  )
    ? 0.5
    : 1;
  return baseValue * damageDiscount * onDeployDiscount;
}

export function wouldBeDestroyed(unit: UnitDeployed, attacker: UnitDeployed) {
  return attacker.power >= unit.health + (unit.keywords?.armor || 0);
}

export function wouldBeDestroyedBySpell(unit: UnitDeployed, spell: SpellCard) {
  let wouldBeDestroyed = false;
  spell.actions.forEach((action) => {
    if (action.effect.name === 'destroyUnit') {
      wouldBeDestroyed = true;
    }
    if (
      action.effect.name === 'damageUnit' &&
      action.effect.args.damage >= unit.health + (unit.keywords?.resist || 0)
    ) {
      wouldBeDestroyed = true;
    }
  });
  return wouldBeDestroyed;
}

export function wouldBeDestroyedByCounterAttack(
  unit: UnitDeployed,
  counterAttackers: UnitDeployed[]
) {
  let damage = 0;
  counterAttackers.forEach((attacker) => {
    damage += attacker.power - (unit.keywords?.armor || 0);
  });
  return damage >= unit.health;
}

// returns total AI units values minus total player units values
export function valueBoard(): number {
  const playerId = bs.players.filter((player) => player.isPlayer)[0].id;
  const aiUnits = bs.units.filter((unit) => unit.ownerPlayerId !== playerId);
  const playerUnits = bs.units.filter((unit) => unit.ownerPlayerId === playerId);
  const aiUnitsValue = aiUnits.reduce((acc, unit) => acc + valueUnit(unit), 0);
  const playerUnitsValue = playerUnits.reduce((acc, unit) => acc + valueUnit(unit), 0);
  return aiUnitsValue - playerUnitsValue;
}
