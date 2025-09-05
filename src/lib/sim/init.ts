import { BASE_DECK } from '@/data/base-deck';
import { gs } from '../_state/main.svelte';
import { getFullCollection } from './collection';

export const initSim = async () => {
  gs.collection = getFullCollection();
  gs.decks = [BASE_DECK];
};
