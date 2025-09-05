import { BASE_DECK } from '@/data/base-deck';
import { gs } from '../_state/main.svelte';
import { getFullCollection } from './collection';

export const initSim = async () => {
  console.log('initSim');
  gs.player.collection = getFullCollection();
  gs.player.decks = [BASE_DECK];
};
