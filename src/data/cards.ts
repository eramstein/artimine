import { CardColor, CardType, type CardTemplate } from '@/lib/_model';

export const cards: Record<string, CardTemplate> = {
  lion: {
    id: 'lion',
    name: 'Savannah Lion',
    type: CardType.Unit,
    cost: 1,
    power: 2,
    maxHealth: 5,
    colors: [{ color: CardColor.Red, count: 1 }],
    keywords: {
      ranged: true,
      moveAndAttack: true,
      retaliate: 1,
      armor: 1,
      haste: true,
      poisonous: 2,
      regeneration: 1,
    },
  },
};
