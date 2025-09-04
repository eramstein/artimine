import { gs } from '../_state/main.svelte';
import { getFullCollection } from './collection';
import { BASE_DECK } from './decks';

export const initSim = async () => {
  gs.collection = getFullCollection();
  gs.decks = [BASE_DECK];
};
