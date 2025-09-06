import { BASE_DECK } from '@/data/base-deck';
import { CardSet } from '../_model/enums-battle';
import { ItemType } from '../_model/enums-sim';
import { gs } from '../_state/main.svelte';
import { getFullCollection } from './collection';

export const initSim = async () => {
  gs.player.collection = getFullCollection();
  gs.player.decks = [BASE_DECK];
  const goblinCave = gs.places.find((p) => p.key === 'goblin_counter');
  goblinCave!.shopInventory = [
    {
      key: 'booster_alpha',
      name: 'Booster',
      type: ItemType.Booster,
      price: 10,
      variant: CardSet.Alpha,
    },
  ];
  gs.player.cash = 100;
};
