import type { ActionTypeDefinition, CharacterAttributes } from '@/lib/_model';
import { Difficulty } from '@/lib/_model/enums-sim';
import { gs } from '@/lib/_state';
import { checkActionSuccess } from '../roll';

const difficultyNumbers = {
  [Difficulty.AutomaticSuccess]: -1000,
  [Difficulty.ExtremelyEasy]: -5,
  [Difficulty.VeryEasy]: 0,
  [Difficulty.Easy]: 5,
  [Difficulty.Medium]: 10,
  [Difficulty.Hard]: 15,
  [Difficulty.VeryHard]: 20,
  [Difficulty.ExtremelyHard]: 25,
  [Difficulty.Impossible]: 1000,
};

export const generalChallengeAction: ActionTypeDefinition = {
  checkSuccess: rollCheckSuccess,
  description: 'A character tries to achieve an action that requires an attribute check',
  getLabel: ({
    challengeDescription,
    attribute,
    difficulty,
  }: {
    challengeDescription: string;
    attribute: string;
    difficulty: Difficulty;
  }) => {
    return `Challenge Check: ${challengeDescription} ${attribute} ${difficulty}`;
  },
};

function rollCheckSuccess(args: {
  attribute: keyof CharacterAttributes;
  challengeDescription: string;
  difficulty: Difficulty;
}) {
  const difficulty = difficultyNumbers[args.difficulty];
  const outcome = checkActionSuccess(args.attribute, difficulty);

  return {
    success: outcome.success,
    isCritical: outcome.isCritical,
    descriptionSuccess: `${gs.player.name} succeeded to ${args.challengeDescription}`,
    descriptionFailure: `${gs.player.name} failed to ${args.challengeDescription}`,
  };
}
