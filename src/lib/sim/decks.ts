import type { Deck } from '../_model';
import { gs } from '../_state';
import { getRandomFromArray } from '../_utils/random';

export function createNewDeck(name: string): Deck {
  const deck = {
    key: crypto.randomUUID(),
    name,
    cards: [],
    lands: [],
    record: {
      wins: 0,
      losses: 0,
      cardResults: {},
    },
  };
  gs.player.decks.push(deck);
  return deck;
}

export function deleteDeck(deck: Deck) {
  gs.player.decks = gs.player.decks.filter((d) => d.key !== deck.key);
}

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

export function pickNpcDeck(npcKey: string): Deck {
  return getRandomFromArray(gs.characters[npcKey].decks);
}

export function updateDeckRecord(deck: Deck, win: boolean, playedCards: string[]) {
  if (win) {
    deck.record.wins++;
    playedCards.forEach((card) => {
      deck.record.cardResults[card] = (deck.record.cardResults[card] || 0) + 1;
    });
  } else {
    deck.record.losses++;
    playedCards.forEach((card) => {
      deck.record.cardResults[card] = (deck.record.cardResults[card] || 0) - 1;
    });
  }
}

export function renameDeck(deck: Deck, name: string) {
  deck.name = name;
}
