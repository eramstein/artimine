import type { Npc } from '../_model';
import { gs } from '../_state';

export function getGroupDescription(characters: Npc[]) {
  let description = '';
  for (const character of characters) {
    description += `- **${character.name}**
        ${character.personality}
        ${character.bio}
      **Relation to ${gs.player.name}:** ${character.relationSummary}\n\n`;
  }
  return description;
}
