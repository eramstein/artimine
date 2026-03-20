import type { Npc } from '@/lib/_model';
import { CHARACTER_EMMA } from './emma';
import { CHARACTER_HENRY } from './henry';
import { CHARACTER_MOLLY } from './molly';
import { CHARACTER_OUSMANE } from './ousmane';
import { CHARACTER_PLAYER } from './player';
import { CHARACTER_THE_DUDE } from './the-dude';

export const CHARACTERS: Record<string, Npc> = {
  [CHARACTER_THE_DUDE.key]: addDefaultCollectionAndDecks(CHARACTER_THE_DUDE),
  [CHARACTER_EMMA.key]: addDefaultCollectionAndDecks(CHARACTER_EMMA),
  [CHARACTER_HENRY.key]: addDefaultCollectionAndDecks(CHARACTER_HENRY),
  [CHARACTER_MOLLY.key]: addDefaultCollectionAndDecks(CHARACTER_MOLLY),
  [CHARACTER_OUSMANE.key]: addDefaultCollectionAndDecks(CHARACTER_OUSMANE),
};

export const CHARACTERS_CARD_UNLOCKS: Record<string, string[]> = {
  [CHARACTER_MOLLY.key]: ['dunyazad', 'ali_baba'],
  [CHARACTER_THE_DUDE.key]: ['ragnar_lothbrok', 'kobold_undercity'],
  [CHARACTER_OUSMANE.key]: ['franz', 'ourssaf'],
  [CHARACTER_EMMA.key]: ['council_envoy', 'donatello'],
};

function addDefaultCollectionAndDecks(character: any): Npc {
  return {
    ...character,
    relationSummary: `${CHARACTER_PLAYER.name} is unknown to me.`,
    period: {
      interactionsSummary: '',
      trades: 0,
    },
    relationValues: {
      friendship: 0,
      love: 0,
      respect: 0,
    },
    decks: [],
    collection: [],
    items: [],
    perks: {},
    unlocks: {
      lastUnlock: 0,
      cards: [],
    },
    gifting: {
      cards: [],
    },
  };
}

export const CHARACTERS_LEGENDARY_CARDS: Record<string, string[]> = {
  [CHARACTER_THE_DUDE.key]: ['dudes_arms_stash'],
  [CHARACTER_EMMA.key]: ['emmas_dark_tower'],
  [CHARACTER_HENRY.key]: ['henrys_cemetary'],
  [CHARACTER_MOLLY.key]: ['mollys_oasis'],
  [CHARACTER_OUSMANE.key]: ['ousmanes_summoning_circle'],
};
