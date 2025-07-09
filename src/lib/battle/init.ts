import { bs } from '../_state';
import { FOE_DECK, PLAYER_DECK } from '@/data';
import { drawCard, shuffleDeck } from './deck';
import { config } from '../_config';

export const initBattle = () => {
  bs.turn = 1;
  bs.players = [
    {
      name: 'Henry',
      isPlayer: true,
      mana: config.initialMana,
      maxMana: config.initialMana,
      life: config.initialLife,
      hand: [],
      deck: shuffleDeck(
        PLAYER_DECK.map((card) => ({
          ...card,
          owner: bs.players[0],
          instanceId: crypto.randomUUID(),
        }))
      ),
      graveyard: [],
    },
    {
      name: 'The Dude',
      isPlayer: false,
      mana: config.initialMana,
      maxMana: config.initialMana,
      life: config.initialLife,
      hand: [],
      deck: shuffleDeck(
        FOE_DECK.map((card) => ({
          ...card,
          owner: bs.players[1],
          instanceId: crypto.randomUUID(),
        }))
      ),
      graveyard: [],
    },
  ];
  for (let i = 0; i < config.initialHandSize; i++) {
    drawCard(bs.players[0]);
    drawCard(bs.players[1]);
  }
};
