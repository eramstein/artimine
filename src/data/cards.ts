import { CardColor, CardType, StatusType, type CardTemplate } from '@/lib/_model';
import { DataAbilityTemplates, DataTriggerTemplates } from '@/lib/battle/abilities';
import { DataEffectTemplates } from '@/lib/battle/effects';
import { cards_G } from './cards_G';
import { cards_R } from './cards_R';
import { cards_GB } from './cards_GB';
import { cards_B } from './cards_B';

export const cards: Record<string, CardTemplate> = {
  lion: {
    id: 'lion',
    name: 'Savannah Lion',
    type: CardType.Unit,
    cost: 2,
    power: 2,
    maxHealth: 3,
    colors: [{ color: CardColor.Red, count: 1 }],
    abilities: [
      {
        text: 'Adjacent units get +1 armor',
        effect: DataEffectTemplates.staticKeywordAdjAllies({
          name: 'ProtectAdjacent',
          keyword: { key: 'armor', value: 1 },
        }),
        trigger: DataTriggerTemplates.static,
      },
      DataAbilityTemplates.cc({ duration: 3, statusType: StatusType.Mezz }),
    ],
  },
  ...cards_G,
  ...cards_R,
  ...cards_GB,
  ...cards_B,
};
