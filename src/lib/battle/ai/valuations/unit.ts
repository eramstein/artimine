import { TriggerType, type UnitDeployed } from '@/lib/_model';
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
