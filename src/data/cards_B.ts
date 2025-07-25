import { CardColor, CardType, CounterType, type CardTemplate } from '@/lib/_model';
import { DataAbilityTemplates, DataTriggerTemplates, SpellTemplates } from '@/lib/battle/abilities';
import { DataEffectTemplates, DataUnitFilters } from '@/lib/battle/effects';
import { DataTargetTemplates } from '@/lib/battle/target';

export const cards_B: Record<string, CardTemplate> = {
  raise_dead: {
    id: 'raise_dead',
    name: 'Raise Dead',
    text: 'Put a unit from your graveyard into play',
    type: CardType.Spell,
    cost: 2,
    colors: [{ color: CardColor.Black, count: 1 }],
    ...SpellTemplates.reanimate({}),
  },
  decaying_ray: {
    id: 'decaying_ray',
    name: 'Decaying Ray',
    text: 'Add 2 decay counters on all units in the row',
    type: CardType.Spell,
    cost: 1,
    colors: [{ color: CardColor.Black, count: 1 }],
    ...SpellTemplates.addCounters({
      counterType: CounterType.Decay,
      counterValue: 2,
      range: DataUnitFilters.inRow(),
    }),
  },
};
