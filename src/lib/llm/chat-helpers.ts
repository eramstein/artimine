import type { Npc } from '../_model';
import { gs } from '../_state';

export function getGroupDescription(characters: Npc[]) {
  let description = '';
  for (const character of characters) {
    const tags =
      character.relationTags.length > 0
        ? `\n      ⚠️ **IMPORTANT — Special Relationship Tags (these MUST shape all dialogue and behaviour):** ${character.relationTags.join(', ')}`
        : '';
    description += `- **${character.name}**
        ${character.personality}
        ${character.bio}
      **Relation to ${gs.player.name}:** ${character.relationSummary}${tags}\n\n`;
  }
  return description;
}
