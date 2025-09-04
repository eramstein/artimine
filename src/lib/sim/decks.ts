import type { Deck } from '../_model';

export const BASE_DECK: Deck = {
  key: 'base',
  name: 'Base',
  cards: [
    {
      cardTemplateId: 'hobbit_gardener',
      count: 10,
    },
    {
      cardTemplateId: 'hobbit_villager',
      count: 10,
    },
    {
      cardTemplateId: 'young_hobbit',
      count: 10,
    },
  ],
  lands: ['forest', 'mountain', 'island', 'city'],
};

export function addCardToDeck(deck: Deck, cardTemplateId: string) {
  const card = deck.cards.find((card) => card.cardTemplateId === cardTemplateId);
  if (card) {
    card.count++;
  } else {
    deck.cards.push({ cardTemplateId, count: 1 });
  }
}

export function removeCardFromDeck(deck: Deck, cardTemplateId: string) {
  const card = deck.cards.find((card) => card.cardTemplateId === cardTemplateId);
  if (!card) return;
  if (card.count === 1) {
    deck.cards = deck.cards.filter((card) => card.cardTemplateId !== cardTemplateId);
  } else {
    card.count--;
  }
}
