import type { Character } from '../_model';

export function getGroupDescription(characters: Character[]) {
  let description = '';
  for (const character of characters) {
    description += ` - ${character.bio} \n`;
  }
  return description;
}
