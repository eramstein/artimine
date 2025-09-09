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

function addDefaultCollectionAndDecks(character: any): Npc {
  return {
    ...character,
    relationSummary: `${CHARACTER_PLAYER.name} is unknown to me.`,
    collection: [],
    items: [],
  };
}
