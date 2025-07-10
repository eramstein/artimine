import { CardColor, type LandTemplate } from '@/lib/_model';

export const lands: Record<string, LandTemplate> = {
  mountain: {
    id: 'mountain',
    name: 'Mountain',
    colors: [{ color: CardColor.Red, count: 1 }],
    health: 10,
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    colors: [{ color: CardColor.Green, count: 1 }],
    health: 10,
  },
  swamp: {
    id: 'swamp',
    name: 'Swamp',
    colors: [{ color: CardColor.Black, count: 1 }],
    health: 10,
  },
  island: {
    id: 'island',
    name: 'Island',
    colors: [{ color: CardColor.Blue, count: 1 }],
    health: 10,
  },
};
