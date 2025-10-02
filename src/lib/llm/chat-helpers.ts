import type { Npc } from '../_model';
import { gs } from '../_state';
import { getCharismaRollPrompt } from './charisma';

export function getGroupDescription(characters: Npc[]) {
  let description = '';
  for (const character of characters) {
    description += `- **${character.name}** - ${character.bio}\n
    **Relation to ${gs.player.name}:** ${character.relationSummary}\n
    **Current Perception of ${gs.player.name} (Charisma effect):** ${getCharismaRollPrompt(character.periodCharismaRoll)}\n\n`;
  }
  return description;
}
