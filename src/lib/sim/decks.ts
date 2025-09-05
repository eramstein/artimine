import type { Deck } from '../_model';

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

export function addLandToDeck(deck: Deck, landId: string) {
  if (deck.lands.includes(landId)) {
    return;
  }
  deck.lands.push(landId);
}

export function removeLandFromDeck(deck: Deck, landId: string) {
  deck.lands = deck.lands.filter((land) => land !== landId);
}
