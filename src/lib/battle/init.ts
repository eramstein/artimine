import { bs } from '../_state';
import { FOE_DECK, FOE_LANDS, PLAYER_DECK, PLAYER_LANDS } from '@/data';
import { drawCard, shuffleDeck } from './deck';
import { config } from '../_config';
import { incrementColorsFromLands } from './land';

export const initBattle = () => {
  console.log('initBattle');
  bs.turn = 1;
  bs.players = [
    {
      id: 0,
      name: 'Henry',
      isPlayer: true,
      mana: config.initialMana,
      maxMana: config.initialMana,
      life: config.initialLife,
      hand: [],
      deck: shuffleDeck(
        PLAYER_DECK.map((card) => ({
          ...card,
          ownerPlayerId: 0,
          instanceId: crypto.randomUUID(),
        }))
      ),
      graveyard: [],
      colors: {},
      lands: PLAYER_LANDS.map((land, index) => ({
        ...land,
        ownerPlayerId: 0,
        instanceId: crypto.randomUUID(),
        position: index,
      })),
    },
    {
      id: 1,
      name: 'The Dude',
      isPlayer: false,
      mana: config.initialMana,
      maxMana: config.initialMana,
      life: config.initialLife,
      hand: [],
      deck: shuffleDeck(
        FOE_DECK.map((card) => ({
          ...card,
          ownerPlayerId: 1,
          instanceId: crypto.randomUUID(),
        }))
      ),
      graveyard: [],
      colors: {},
      lands: FOE_LANDS.map((land, index) => ({
        ...land,
        ownerPlayerId: 1,
        instanceId: crypto.randomUUID(),
        position: index,
      })),
    },
  ];
  for (let i = 0; i < config.initialHandSize; i++) {
    drawCard(bs.players[0]);
    drawCard(bs.players[1]);
  }
  incrementColorsFromLands(bs.players[0]);
  incrementColorsFromLands(bs.players[1]);
};
