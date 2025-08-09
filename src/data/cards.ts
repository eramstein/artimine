import { CardColor, CardRarity, CardType, StatusType, type CardTemplate } from '@/lib/_model';
import { cards_G } from './cards_G';
import { cards_R } from './cards_R';
import { cards_GB } from './cards_GB';
import { cards_B } from './cards_B';

export const cards: Record<string, CardTemplate> = {
  lion: {
    id: 'lion',
    name: 'Savannah Lion',
    type: CardType.Unit,
    rarity: CardRarity.Common,
    cost: 2,
    power: 2,
    maxHealth: 3,
    colors: [{ color: CardColor.Red, count: 1 }],
  },
  ...cards_G,
  ...cards_R,
  ...cards_GB,
  ...cards_B,
};
