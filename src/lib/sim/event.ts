import { DEFAULT_PLOTS } from '@/data/text/plots';
import { antagonisticReactions, positiveReactions } from '@/data/text/reactions';
import type { CharacterAttributes, Event, EventOption, Npc, RelationValues } from '../_model';
import { ActivityType, Difficulty } from '../_model';
import { gs } from '../_state';
import { getRandomFromArray, getRandomInteger } from '../_utils/random';
import { generateEventWithLLM, resolveEventWithLLM } from '../llm/event';
import { difficultyNumbers } from './actions/general-challenge';
import { updateNpcRelationValue } from './relation';
import { checkActionSuccess } from './roll';

export async function createEventForCurrentActivity() {
  if (gs.activity.activityType === ActivityType.Chill && !gs.activity.participants.length) {
    return;
  }
  const newEvent: Event = {
    title: '',
    description: '',
    participants: [],
    options: [],
    history: [],
  };
  // TODO: handle events with multiple acting characters
  const actingCharacter = gs.characters[getRandomFromArray(gs.activity.participants)];
  const plot = getPlot(gs.activity.activityType, actingCharacter);
  const options = makeEventOptions(actingCharacter, gs.activity.activityType);
  const llmEvent = await generateEventWithLLM(plot, options, [actingCharacter]);
  newEvent.participants = [actingCharacter.key];
  newEvent.title = llmEvent.title;
  newEvent.description = llmEvent.description;
  newEvent.options = options.map((option, i) => ({
    ...option,
    description: llmEvent.options[i].description || option.description,
  }));
  gs.activity.event = newEvent;
}

function getPlot(activityType: ActivityType, character: Npc): string {
  if (character.ambitions.length === 0) {
    return getRandomFromArray(DEFAULT_PLOTS);
  }
  return character.ambitions[0].summary;
}

function makeEventOptions(character: Npc, activityType: ActivityType): EventOption[] {
  const options: EventOption[] = [];
  // 2 options which continue the event
  const oneNegative =
    Math.random() > (character.relationValues.friendship + character.relationValues.love) / 20;
  for (let index = 0; index < 2; index++) {
    options.push({
      description:
        index === 0 || !oneNegative
          ? getRandomFromArray(positiveReactions)
          : getRandomFromArray(antagonisticReactions),
      stopPoint: false,
    });
  }
  // 2 options which end the event
  for (let index = 0; index < 2; index++) {
    // TODO: other option types than simple attribute checks and relation outcome
    const impactedRelation = getRandomFromArray(['friendship', 'love', 'respect']);
    const impact = getRandomInteger(1, 2);
    const testedAttribute = getRandomFromArray([
      'charisma',
      'intelligence',
      'vitality',
      'dexterity',
    ]);
    const difficulty = getRandomFromArray([
      Difficulty.VeryEasy,
      Difficulty.Easy,
      Difficulty.Medium,
      Difficulty.Hard,
      Difficulty.VeryHard,
    ]);
    options.push({
      description: '',
      stopPoint: true,
      relatedAttribute: testedAttribute as keyof CharacterAttributes,
      difficulty: difficulty,
      onSuccess: {
        relation: { [impactedRelation]: impact },
      },
      onFailure: {
        relation: { [impactedRelation]: -impact },
      },
    });
  }
  return options;
}

export async function setEventOutcome(optionIndex: number) {
  if (
    !gs.activity.event ||
    !gs.activity.event.options ||
    gs.activity.event.options.length <= optionIndex
  ) {
    return;
  }
  const event = gs.activity.event;
  const option = event.options[optionIndex];
  if (option.stopPoint) {
    if (option.relatedAttribute && option.difficulty) {
      const difficulty = difficultyNumbers[option.difficulty] ?? difficultyNumbers.medium;
      const outcome = checkActionSuccess(option.relatedAttribute, difficulty);
      const outcomeDescription = await resolveEventWithLLM(
        option.description,
        outcome.success,
        outcome.isCritical
      );
      const relationValuesByCharacter: Record<string, RelationValues> = {};
      event.participants.forEach((npc) => {
        relationValuesByCharacter[npc] = { friendship: 0, love: 0, respect: 0 };
      });
      if (option.onSuccess && outcome.success) {
        if (option.onSuccess.relation) {
          Object.entries(option.onSuccess.relation).forEach(([key, value]) => {
            event.participants.forEach((npc) => {
              updateNpcRelationValue(gs.characters[npc], key as keyof RelationValues, value);
              relationValuesByCharacter[npc][key as keyof RelationValues] = value;
            });
          });
        }
      }
      if (option.onFailure && !outcome.success) {
        if (option.onFailure.relation) {
          Object.entries(option.onFailure.relation).forEach(([key, value]) => {
            event.participants.forEach((npc) => {
              updateNpcRelationValue(gs.characters[npc], key as keyof RelationValues, -value);
              relationValuesByCharacter[npc][key as keyof RelationValues] = -value;
            });
          });
        }
      }
      event.outcome = {
        description: outcomeDescription,
        relationValuesByCharacter,
      };
    } else {
      resolveEventWithLLM(option.description, true, false);
    }
    event.history.push(event.description);
    event.history.push(option.description);
  } else {
    const oldEvent = { ...gs.activity.event };
    const actingCharacter = gs.characters[oldEvent!.participants[0]];
    const plot = `Previous event: ${oldEvent?.description || ''}. What the player did in response: ${option?.description || ''}. Now describe what happens next.`;
    const newOptions = makeEventOptions(actingCharacter, gs.activity.activityType);
    const nextEvent = await generateEventWithLLM(plot, newOptions, [actingCharacter]);
    nextEvent.history = [
      ...(oldEvent?.history || []),
      oldEvent?.description || '',
      option.description,
    ];
    nextEvent.options = newOptions.map((option, i) => ({
      ...option,
      description: nextEvent.options[i].description || option.description,
    }));
    gs.activity.event = {
      ...oldEvent,
      ...nextEvent,
    };
  }
}
