import { cards, lands } from '@/data';
import { BASE_DECK } from '@/data/base-deck';
import { config } from '../_config';
import type { BattleState, Card, Deck, Land } from '../_model';
import { bs, gs } from '../_state';
import { pickNpcDeck } from '../sim/decks';
import { drawCard, shuffleDeck } from './deck';
import { initColorsFromLands } from './land';

export const defaultBattleState: BattleState = {
  turn: 0,
  isPlayersTurn: true,
  playerIdWon: null,
  players: [],
  units: [],
};

export const initBattle = (foeKey: string = 'the-dude', playerDeck: Deck = BASE_DECK) => {
  const foeDeck = pickNpcDeck(foeKey);
  bs.turn = 1;
  bs.players = [
    {
      id: 0,
      name: gs.player.key,
      isPlayer: true,
      mana: config.initialMana,
      maxMana: config.initialMana,
      life: config.initialLife,
      hand: [],
      deck: shuffleDeck(loadDeckCards(playerDeck, 0)),
      graveyard: [],
      colors: {},
      lands: loadDeckLands(playerDeck, 0),
      abilityUsed: false,
    },
    {
      id: 1,
      name: foeKey,
      isPlayer: false,
      mana: config.initialMana,
      maxMana: config.initialMana,
      life: config.initialLife,
      hand: [],
      deck: shuffleDeck(loadDeckCards(foeDeck, 1)),
      graveyard: [],
      colors: {},
      lands: loadDeckLands(foeDeck, 1),
      abilityUsed: false,
    },
  ];
  for (let i = 0; i < config.initialHandSize; i++) {
    drawCard(bs.players[0]);
    drawCard(bs.players[1]);
  }
  bs.players[0].hand.sort((a, b) => a.cost - b.cost);
  initColorsFromLands(bs.players[0]);
  initColorsFromLands(bs.players[1]);

  console.log('initBattle - battle initialized successfully');
};

function loadDeckCards(deck: Deck, ownerPlayerId: number): Card[] {
  const deckCards: Card[] = [];
  for (const card of deck.cards) {
    for (let i = 0; i < card.count; i++) {
      const cardTemplate = cards[card.cardTemplateId];
      deckCards.push({
        ...cardTemplate,
        ownerPlayerId: ownerPlayerId,
        instanceId: crypto.randomUUID(),
      } as Card);
    }
  }
  return deckCards;
}

function loadDeckLands(deck: Deck, ownerPlayerId: number): Land[] {
  const deckLands: Land[] = [];
  for (const [index, land] of deck.lands.entries()) {
    deckLands.push({
      ...lands[land],
      ownerPlayerId: ownerPlayerId,
      instanceId: crypto.randomUUID(),
      position: index,
    } as Land);
  }
  return deckLands;
}
