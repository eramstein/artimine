import type { Character } from '@/lib/_model';
import { CHARACTER_THE_DUDE } from './the-dude';

export const CHARACTERS: Record<string, Character> = {
  [CHARACTER_THE_DUDE.key]: addDefaultCollectionAndDecks(CHARACTER_THE_DUDE),
};

function addDefaultCollectionAndDecks(character: any): Character {
  return {
    ...character,
    collection: [],
    decks: [],
  };
}
