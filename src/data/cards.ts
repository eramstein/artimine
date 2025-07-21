import { CardColor, CardType, type CardTemplate } from '@/lib/_model';
import { DataAbilityTemplates, DataTriggerTemplates } from '@/lib/battle/abilities';
import { DataEffectTemplates } from '@/lib/battle/effects';
import { DataTargetTemplates } from '@/lib/battle/target';
import { cards_G } from './cards_G';
import { cards_R } from './cards_R';

export const cards: Record<string, CardTemplate> = {
  lion: {
    id: 'lion',
    name: 'Savannah Lion',
    type: CardType.Unit,
    cost: 2,
    power: 2,
    maxHealth: 2,
    colors: [{ color: CardColor.Red, count: 1 }],
    abilities: [
      // {
      //   name: 'Protect Adjacent',
      //   text: 'Adjacent units get +1 armor',
      //   effect: DataEffectTemplates.staticKeywordAdjAllies({
      //     name: 'ProtectAdjacent',
      //     keyword: { key: 'armor', value: 1 },
      //   }),
      //   trigger: DataTriggerTemplates.static,
      // },
      DataAbilityTemplates.mezz({ name: 'Mezz', cost: 1 }, { duration: 3 }),
    ],
  },
  ...cards_G,
  ...cards_R,
};
