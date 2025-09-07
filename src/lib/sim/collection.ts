import { cards, lands } from '@/data/loader';
import type { Character } from '../_model';
import { gs } from '../_state/main.svelte';

export function getFullCollection() {
  return [...Object.values(cards), ...Object.values(lands)].map((card) => ({
    cardTemplateId: card.id,
    count: 3,
  }));
}

export function addCardToCollection(cardTemplateId: string, character?: Character) {
  const collection = character ? character.collection : gs.player.collection;
  const existingCard = collection.find((c) => c.cardTemplateId === cardTemplateId);
  if (existingCard) {
    existingCard.count++;
  } else {
    collection.push({
      cardTemplateId: cardTemplateId,
      count: 1,
    });
  }
}
