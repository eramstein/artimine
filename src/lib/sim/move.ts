import type { Npc } from '../_model';
import { gs } from '../_state/main.svelte';

export function moveCharacters(people: Npc[], destinationName: string) {
  const destination = gs.places.find((p) => p.name === destinationName);
  if (!destination) {
    console.log('Destination not found');
    return;
  }
  for (const person of people) {
    person.place = destination.index;
  }
  gs.player.place = destination.index;
}
