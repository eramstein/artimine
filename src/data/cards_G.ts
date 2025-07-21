import { CardColor, CardType, type CardTemplate } from '@/lib/_model';
import { DataAbilityTemplates, DataTriggerTemplates } from '@/lib/battle/abilities';
import { DataEffectTemplates } from '@/lib/battle/effects';
import { DataTargetTemplates } from '@/lib/battle/target';

export const cards_G: Record<string, CardTemplate> = {
  wall_of_bramble: {
    id: 'wall_of_bramble',
    name: 'Wall of Bramble',
    type: CardType.Unit,
    cost: 2,
    power: 1,
    maxHealth: 3,
    colors: [{ color: CardColor.Green, count: 1 }],
    keywords: {
      retaliate: 1,
    },
  },
  grizzly_bear: {
    id: 'grizzly_bear',
    name: 'Grizzly Bear',
    type: CardType.Unit,
    cost: 2,
    power: 2,
    maxHealth: 3,
    colors: [{ color: CardColor.Green, count: 2 }],
  },
  dryad: {
    id: 'dryad',
    name: 'Dryad',
    type: CardType.Unit,
    cost: 3,
    power: 2,
    maxHealth: 4,
    colors: [{ color: CardColor.Green, count: 2 }],
    keywords: {
      regeneration: 1,
    },
  },
  snek: {
    id: 'snek',
    name: 'Venomous Snake',
    type: CardType.Unit,
    cost: 3,
    power: 3,
    maxHealth: 4,
    colors: [{ color: CardColor.Green, count: 3 }],
    keywords: {
      poisonous: 1,
    },
  },
  young_ent: {
    id: 'young_ent',
    name: 'Young Treeman',
    type: CardType.Unit,
    cost: 4,
    power: 2,
    maxHealth: 4,
    colors: [{ color: CardColor.Green, count: 3 }],
    keywords: {
      retaliate: 1,
      armor: 1,
    },
  },
};
