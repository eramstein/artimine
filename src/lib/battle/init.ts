import { FOE_DECK, FOE_LANDS, FOE_NAME, PLAYER_DECK, PLAYER_LANDS, PLAYER_NAME } from '@/data';
import { config } from '../_config';
import { bs } from '../_state';
import { drawCard, shuffleDeck } from './deck';
import { initColorsFromLands } from './land';

export const initBattle = () => {
  bs.turn = 1;
  bs.players = [
    {
      id: 0,
      name: PLAYER_NAME,
      isPlayer: true,
      mana: config.initialMana,
      maxMana: config.initialMana,
      life: config.initialLife,
      hand: [],
      deck: PLAYER_DECK().map((card) => ({
        ...card,
        ownerPlayerId: 0,
        instanceId: crypto.randomUUID(),
      })),
      graveyard: [],
      colors: {},
      lands: PLAYER_LANDS().map((land, index) => ({
        ...land,
        ownerPlayerId: 0,
        instanceId: crypto.randomUUID(),
        position: index,
      })),
      abilityUsed: false,
    },
    {
      id: 1,
      name: FOE_NAME,
      isPlayer: false,
      mana: config.initialMana,
      maxMana: config.initialMana,
      life: config.initialLife,
      hand: [],
      deck: shuffleDeck(
        FOE_DECK().map((card) => ({
          ...card,
          ownerPlayerId: 1,
          instanceId: crypto.randomUUID(),
        }))
      ),
      graveyard: [],
      colors: {},
      lands: FOE_LANDS().map((land, index) => ({
        ...land,
        ownerPlayerId: 1,
        instanceId: crypto.randomUUID(),
        position: index,
      })),
      abilityUsed: false,
    },
  ];
  for (let i = 0; i < config.initialHandSize; i++) {
    drawCard(bs.players[0]);
    drawCard(bs.players[1]);
  }
  initColorsFromLands(bs.players[0]);
  initColorsFromLands(bs.players[1]);

  console.log('initBattle - battle initialized successfully');
};
