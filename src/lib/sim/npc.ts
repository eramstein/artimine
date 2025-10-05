import { cards, lands } from '@/data';
import { CHARACTERS_LEGENDARY_CARDS } from '@/data/characters/main';
import type { CardColor, CardTemplate, CardTuple, Deck, Npc, UnitCardTemplate } from '../_model';
import { CardSet } from '../_model/enums-battle';
import { gs } from '../_state/main.svelte';
import { getRandomFromArray } from '../_utils/random';
import { openBoosterForCharacter } from './booster';
import { addCardToDeck, addLandToDeck, removeCardFromDeck, removeLandFromDeck } from './decks';

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
      removeWeakestCardFromDeck(deck, npc);
      addNewCardToDeck(deck, npc.collection);
      addLegendaryCardToDeck(deck, npc);
    });
  }
}

function removeWeakestCardFromDeck(deck: Deck, npc: Npc) {
  const characterLegendaryCards = CHARACTERS_LEGENDARY_CARDS[npc.key];
  const worseCards = deck.cards
    .filter((c) => !characterLegendaryCards.includes(c.cardTemplateId))
    .sort(
      (a, b) =>
        deck.record.cardResults[a.cardTemplateId] - deck.record.cardResults[b.cardTemplateId]
    );
  removeCardFromDeck(deck, worseCards[0].cardTemplateId);
}

function addNewCardToDeck(deck: Deck, collection: CardTuple[]) {
  let cardToAdd = '';
  const deckColors = deck.lands.reduce(
    (acc, land) => acc.concat(lands[land].colors.map((color) => color.color)),
    [] as CardColor[]
  );
  const eligibleCards = collection.filter((tuple) => {
    const card = cards[tuple.cardTemplateId];
    return (
      !lands[tuple.cardTemplateId] &&
      !card.colors.some((color) => !deckColors.includes(color.color)) &&
      (!card || isCardUsableByAi(card))
    );
  });
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

// AI can handle either cards with no abilities, or cards with aiHints
function isCardUsableByAi(card: CardTemplate) {
  return card.aiHints || !(card as UnitCardTemplate).abilities;
}

// if the deck has a bad record, add a legendary card to buff it
function addLegendaryCardToDeck(deck: Deck, npc: Npc) {
  if (deck.record.wins - deck.record.losses >= -1) {
    return;
  }
  // reset the record
  deck.record.wins = 0;
  deck.record.losses = 0;

  // add a legendary card to the deck
  const characterLegendaryCards = CHARACTERS_LEGENDARY_CARDS[npc.key];
  const legendaryCardsInDeckAlready = [
    ...deck.cards.map((card) => card.cardTemplateId),
    ...deck.lands,
  ].filter((card) => {
    return characterLegendaryCards.includes(card);
  });
  const legendaryCardsNotInDeckAlready = characterLegendaryCards.filter(
    (card) => !legendaryCardsInDeckAlready.includes(card)
  );
  if (legendaryCardsNotInDeckAlready.length === 0) {
    return;
  }
  const pickedCard = getRandomFromArray(legendaryCardsNotInDeckAlready);
  const legendaryLand = lands[pickedCard];
  if (legendaryLand) {
    const wasRemoved = removeWeakestLandFromDeck(deck);
    if (wasRemoved) {
      addLandToDeck(deck, pickedCard);
    }
  } else {
    removeWeakestCardFromDeck(deck, npc);
    addCardToDeck(deck, pickedCard);
  }
}

function removeWeakestLandFromDeck(deck: Deck): boolean {
  // remove colorless lands in priority
  const colorlessLands = deck.lands.filter((land) => lands[land].colors.length === 0);
  if (colorlessLands.length > 0) {
    removeLandFromDeck(deck, colorlessLands[0]);
    return true;
  }

  const colorCount: Record<CardColor, number> = {
    red: 0,
    blue: 0,
    green: 0,
    black: 0,
  };
  deck.lands.forEach((land) => {
    lands[land].colors.forEach((color) => {
      colorCount[color.color] += 1;
    });
  });
  const mostUsedColor: CardColor = Object.entries(colorCount).sort(
    (b, a) => a[1] - b[1]
  )[0][0] as CardColor;
  if (colorCount[mostUsedColor] > 1) {
    removeLandFromDeck(deck, mostUsedColor);
    return true;
  }
  return false;
}
