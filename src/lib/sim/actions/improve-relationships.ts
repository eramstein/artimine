import { Difficulty } from '@/lib/_model';
import { type ActionTypeDefinition, type RelationValues } from '@/lib/_model/model-game';
import { gs } from '@/lib/_state';
import { checkActionSuccess } from '../roll';

const difficultyNumbers = {
  [Difficulty.AutomaticSuccess]: -1000,
  [Difficulty.ExtremelyEasy]: 0,
  [Difficulty.VeryEasy]: 3,
  [Difficulty.Easy]: 6,
  [Difficulty.Medium]: 10,
  [Difficulty.Hard]: 13,
  [Difficulty.VeryHard]: 17,
  [Difficulty.ExtremelyHard]: 20,
  [Difficulty.Impossible]: 1000,
};

export const improveRelationshipsAction: ActionTypeDefinition = {
  onSuccess: (
    {
      people,
      relationType,
    }: {
      people: string[];
      relationType: keyof RelationValues;
    },
    isCritical?: boolean
  ) => {
    if (gs.player.period.improvedRelations) return;
    gs.player.period.improvedRelations = true;
    const peopleNpcs = people
      .map((person) => Object.values(gs.characters).find((c) => c.name === person))
      .filter((p) => p !== undefined);
    peopleNpcs.forEach((npc) => {
      if (npc.relationValues[relationType] !== undefined) {
        npc.relationValues[relationType] += isCritical ? 2 : 1;
      }
    });
  },
  onFailure: (
    {
      people,
      relationType,
    }: {
      people: string[];
      relationType: keyof RelationValues;
    },
    isCritical?: boolean
  ) => {
    if (gs.player.period.improvedRelations) return;
    gs.player.period.improvedRelations = true;
    const peopleNpcs = people
      .map((person) => Object.values(gs.characters).find((c) => c.name === person))
      .filter((p) => p !== undefined);
    peopleNpcs.forEach((npc) => {
      if (npc.relationValues[relationType] !== undefined) {
        npc.relationValues[relationType] -= isCritical ? 2 : 1;
      }
    });
  },
  checkSuccess: rollCheckSuccess,
  description: 'Tries to improve the relationship with a character, e.g. befriend or charm',
  getLabel: ({
    people,
    relationType,
    difficulty,
  }: {
    people: string[];
    relationType: keyof RelationValues;
    difficulty: Difficulty;
  }) => {
    return `Improve ${relationType} with ${people.join(', ')} ${difficulty}`;
  },
};

function rollCheckSuccess(args: {
  people: string[];
  relationType: keyof RelationValues;
  difficulty: Difficulty;
}) {
  const difficulty = difficultyNumbers[args.difficulty];
  const outcome = checkActionSuccess('charisma', difficulty);

  return {
    success: outcome.success,
    isCritical: outcome.isCritical,
    descriptionSuccess: outcome.isCritical
      ? `Critical success! ${gs.player.name} very much improved the ${args.relationType} ${args.people.join(', ')} feelings`
      : `${gs.player.name} improved the ${args.relationType} ${args.people.join(', ')} feelings`,
    descriptionFailure: outcome.isCritical
      ? `Critical failure! ${gs.player.name} very much worsened the ${args.relationType} ${args.people.join(', ')} feelings`
      : `${gs.player.name} did not improve the ${args.relationType} ${args.people.join(', ')} feelings`,
  };
}
