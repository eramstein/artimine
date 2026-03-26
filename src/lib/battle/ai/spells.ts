import type { SpellCard, UnitDeployed } from '@/lib/_model';

// returns ratio (0 to 1) of a unit's health that would be depleted by that spell
export function spellWouldKillUnit(spell: SpellCard, unit: UnitDeployed): number {
  if (spell.actions.some((action) => action.effect.name === 'destroyUnit')) return 1;
  if (spell.actions.some((action) => action.effect.name === 'damageUnit')) {
    const damageAction = spell.actions.find((action) => action.effect.name === 'damageUnit');
    if (damageAction) {
      const damage = damageAction.effect.args.amount;
      return damage / unit.health;
    }
  }
  return 0;
}
