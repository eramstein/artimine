import { CardColor, CardType, type CardTemplate } from '@/lib/_model';

export const cards: Record<string, CardTemplate> = {
  lion: {
    id: 'lion',
    name: 'Savannah Lion',
    type: CardType.Unit,
    cost: 1,
    power: 2,
    maxHealth: 1,
    colors: [{ color: CardColor.Red, count: 1 }],
  },
};
