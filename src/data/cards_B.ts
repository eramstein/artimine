import {
  CardColor,
  CardType,
  CounterType,
  type CardTemplate,
  type UnitDeployed,
} from '@/lib/_model';
import { bs } from '@/lib/_state';
import { DataAbilityTemplates, DataTriggerTemplates, SpellTemplates } from '@/lib/battle/abilities';
import { addCounters, removeCounters } from '@/lib/battle/counter';
import { DataEffectTemplates, DataUnitFilters } from '@/lib/battle/effects';
import { DataTargetTemplates } from '@/lib/battle/target';

export const cards_B: Record<string, CardTemplate> = {
  raise_dead: {
    id: 'raise_dead',
    name: 'Raise Dead',
    type: CardType.Spell,
    cost: 2,
    colors: [{ color: CardColor.Black, count: 1 }],
    ...SpellTemplates.reanimate({}),
  },
  decaying_ray: {
    id: 'decaying_ray',
    name: 'Decaying Ray',
    type: CardType.Spell,
    cost: 4,
    colors: [{ color: CardColor.Black, count: 2 }],
    ...SpellTemplates.addCounters({
      counterType: CounterType.Decay,
      counterValue: 2,
      range: DataUnitFilters.inRow(),
    }),
  },
  guinea_pig: {
    id: 'guinea_pig',
    name: 'Guinea Pig',
    text: 'Move all decay counters to target creature',
    type: CardType.Spell,
    cost: 1,
    colors: [{ color: CardColor.Black, count: 1 }],
    cantrip: true,
    targets: [DataTargetTemplates.units(1)],
    effect: (p) => {
      const unit = p.targets[0][0] as UnitDeployed;
      let movedCounters = 0;
      bs.units.forEach((u) => {
        if (u.instanceId === unit.instanceId) {
          return;
        }
        const decayCounters = u.counters[CounterType.Decay] || 0;
        removeCounters(u, CounterType.Decay, decayCounters);
        movedCounters += decayCounters;
      });
      if (movedCounters > 0) {
        addCounters(unit, CounterType.Decay, movedCounters);
      }
    },
  },
  mosquito: {
    id: 'mosquito',
    name: 'Mosquito',
    type: CardType.Unit,
    cost: 3,
    power: 0,
    maxHealth: 1,
    colors: [{ color: CardColor.Black, count: 2 }],
    abilities: [
      DataAbilityTemplates.counters({
        counterType: CounterType.Decay,
        counterValue: 1,
        range: DataUnitFilters.ennemiesInRow(),
        trigger: DataTriggerTemplates.meMove,
      }),
    ],
  },
  zombie: {
    id: 'zombie',
    name: 'Zombie',
    type: CardType.Unit,
    cost: 2,
    power: 2,
    maxHealth: 2,
    colors: [{ color: CardColor.Black, count: 1 }],
  },
  grim_guard: {
    id: 'grim_guard',
    name: 'Grim Guard',
    type: CardType.Unit,
    cost: 3,
    power: 2,
    maxHealth: 3,
    colors: [{ color: CardColor.Black, count: 1 }],
    keywords: {
      ranged: true,
    },
  },
};
