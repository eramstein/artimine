import { CardColor, CardType, type CardTemplate } from '@/lib/_model';
import { DataAbilityTemplates, DataTriggerTemplates, SpellTemplates } from '@/lib/battle/abilities';
import { DataEffectTemplates } from '@/lib/battle/effects';
import { DataTargetTemplates } from '@/lib/battle/target';

export const cards_B: Record<string, CardTemplate> = {
  raise_dead: {
    id: 'raise_dead',
    name: 'Raise Dead',
    text: 'Put a unit from your graveyard into play',
    type: CardType.Spell,
    cost: 2,
    colors: [{ color: CardColor.Black, count: 3 }],
    ...SpellTemplates.dd({ damage: 3 }),
  },
};
