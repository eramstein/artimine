import { cards, lands } from '@/data/loader';
import type { CardTuple, Character, Deck } from '../_model';
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

export function getCollectionFromDeck(deck: Deck) {
  const cards = deck.cards.map((card: CardTuple) => ({
    cardTemplateId: card.cardTemplateId,
    count: card.count,
  }));
  return [
    ...cards,
    ...deck.lands.map((land: string) => ({
      cardTemplateId: land,
      count: 1,
    })),
  ];
}

// all cards from collection that are not in any deck
export function getAvailableCardsFromCollection(character: Character) {
  return character.collection.filter(
    (c) =>
      !character.decks.some(
        (d) =>
          d.cards.some((card) => card.cardTemplateId === c.cardTemplateId) ||
          d.lands.some((land) => land === c.cardTemplateId)
      )
  );
}
