import type { Place } from '@/lib/_model';
import { CHARACTER_PLAYER } from '../characters/player';

export const PLACES: Place[] = [
  {
    key: 'goblin_counter',
    name: "The Goblin's Den",
    description: `
      The town's favorite place to buy and play board games, card games and role playing games.
      Situated in the city center. Cozy and welcoming.
      `,
  },
  {
    key: 'bedroom',
    name: `${CHARACTER_PLAYER.name}' home`,
    description: "A student's appartment.",
  },
  {
    key: 'uni_courtyard',
    name: 'University',
    description:
      'An old university specialized in cognitive sciences studies. Beautiful buildings from the early 1900s with a germanic style architecture.',
  },
].map((p, i) => ({
  index: i,
  key: p.key,
  name: p.name,
  description: p.description,
}));
