import { type CharacterAttributes } from '../_model/model-game';
import { gs } from '../_state/main.svelte';
import { addRollResult } from '../_state/state-ui.svelte';
import { getRandomInteger } from '../_utils/random';

/*
Attributes are between 0 and 10.
Difficulty is between 0 and 20.
We roll a D10, if attribute + roll is >= to success it's a success.
Natural 10 or 1 are always critical success or failures.
*/
export function checkActionSuccess(
  testedAttribute: string,
  difficulty: number
): { success: boolean; isCritical: boolean } {
  const roll = getRandomInteger(1, 10);
  const attributeValue = gs.player.attributes[testedAttribute as keyof CharacterAttributes];
  const result = roll + attributeValue;

  if (roll === 10) {
    addRollResult({
      success: true,
      isCritical: true,
      roll,
      attribute: testedAttribute,
      difficulty,
    });
    return { success: true, isCritical: true };
  }
  if (roll === 1) {
    addRollResult({
      success: false,
      isCritical: true,
      roll,
      attribute: testedAttribute,
      difficulty,
    });
    return { success: false, isCritical: true };
  }
  const success = result >= difficulty;
  addRollResult({
    success,
    isCritical: false,
    roll,
    attribute: testedAttribute,
    difficulty,
  });
  if (success) {
    return { success: true, isCritical: false };
  }
  return { success: false, isCritical: false };
}
