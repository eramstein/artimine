import { cards, lands } from '@/data/loader';

export function getFullCollection() {
  return [...Object.values(cards), ...Object.values(lands)].map((card) => ({
    cardTemplateId: card.id,
    count: 3,
  }));
}
