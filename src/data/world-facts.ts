import type { WorldFact } from '@/lib/_model/model-game';
import { CHARACTERS } from './characters/main';
import { PLACES } from './places/places';

export const WORLD_FACTS: Omit<WorldFact, 'id' | 'embedding'>[] = [
  ...Object.values(CHARACTERS).map((character) => ({
    description: character.bio,
  })),
  ...PLACES.map((place) => ({
    description: `${place.name}: ${place.description}`,
  })),
];
