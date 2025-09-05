import { BASE_DECK } from '@/data/base-deck';
import { gs } from '../_state/main.svelte';
import { getFullCollection } from './collection';

export const initSim = async () => {
  gs.player.collection = getFullCollection();
  gs.player.decks = [BASE_DECK];
};
