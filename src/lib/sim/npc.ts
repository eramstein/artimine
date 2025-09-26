import { cards, lands } from '@/data';
import type { CardColor, CardTuple, Deck } from '../_model';
import { CardSet } from '../_model/enums-battle';
import { gs } from '../_state/main.svelte';
import { openBoosterForCharacter } from './booster';
import { addCardToDeck, removeCardFromDeck } from './decks';

// every saturday NPCs buy some packs
export function expandNpcCollections() {
  for (const npc of Object.values(gs.characters)) {
    openBoosterForCharacter(npc, CardSet.Alpha);
  }
}

// every saturday NPCs adjust their decks
export function adjustNpcDecks() {
  for (const npc of Object.values(gs.characters)) {
    npc.decks.forEach((deck) => {
      removeWeakestCardFromDeck(deck);
      addNewCardToDeck(deck, npc.collection);
    });
  }
}

function removeWeakestCardFromDeck(deck: Deck) {
  const worseCards = deck.cards.sort(
    (a, b) => deck.record.cardResults[a.cardTemplateId] - deck.record.cardResults[b.cardTemplateId]
  );
  removeCardFromDeck(deck, worseCards[0].cardTemplateId);
}

function addNewCardToDeck(deck: Deck, collection: CardTuple[]) {
  let cardToAdd = '';
  const deckColors = deck.lands.reduce(
    (acc, land) => acc.concat(lands[land].colors.map((color) => color.color)),
    [] as CardColor[]
  );
  const eligibleCards = collection.filter(
    (tuple) =>
      !lands[tuple.cardTemplateId] &&
      !cards[tuple.cardTemplateId].colors.some((color) => !deckColors.includes(color.color))
  );
  eligibleCards.forEach((tuple) => {
    if (deck.cards.find((c) => c.cardTemplateId === tuple.cardTemplateId)) {
      return;
    }
    cardToAdd = tuple.cardTemplateId;
  });
  if (!cardToAdd) {
    const bestCards = deck.cards
      .filter((c) => c.count < 3)
      .sort(
        (b, a) =>
          deck.record.cardResults[a.cardTemplateId] - deck.record.cardResults[b.cardTemplateId]
      );
    cardToAdd = bestCards[0].cardTemplateId;
  }
  console.log('adding card to deck', cardToAdd);
  addCardToDeck(deck, cardToAdd);
}
