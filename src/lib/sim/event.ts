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
  const event = gs.activity.event;
  if (!event || optionIndex >= (event.options?.length ?? 0)) return;

  const option = event.options[optionIndex];

  if (option.stopPoint) {
    await handleEventCompletion(event, option);
  } else {
    await handleEventContinuation(event, option);
  }
}

/**
 * Handles the logic when an event option ends the event (stopPoint: true).
 * Manages attribute checks, relation updates, and outcome generation.
 */
async function handleEventCompletion(event: Event, option: EventOption) {
  const { relatedAttribute, difficulty, description } = option;

  if (relatedAttribute && difficulty) {
    const powerRequirement = difficultyNumbers[difficulty] ?? difficultyNumbers.medium;
    const checkOutcome = checkActionSuccess(relatedAttribute, powerRequirement);

    // Resolve description via LLM
    const outcomeDescription = await resolveEventWithLLM(
      description,
      checkOutcome.success,
      checkOutcome.isCritical
    );

    // Identify which outcome to apply
    const outcomeData = checkOutcome.success ? option.onSuccess : option.onFailure;
    const relationValuesByCharacter: Record<string, RelationValues> = {};

    event.participants.forEach((npcKey) => {
      const npc = gs.characters[npcKey];
      const characterUpdates: RelationValues = { friendship: 0, love: 0, respect: 0 };

      if (outcomeData?.relation) {
        Object.entries(outcomeData.relation).forEach(([key, value]) => {
          const relationKey = key as keyof RelationValues;
          updateNpcRelationValue(npc, relationKey, value);
          characterUpdates[relationKey] = value;
        });
      }

      relationValuesByCharacter[npcKey] = characterUpdates;
    });

    event.outcome = {
      description: outcomeDescription,
      relationValuesByCharacter,
    };
  } else {
    // Basic resolution if no attribute check is required
    await resolveEventWithLLM(description, true, false);
  }

  // Update event history
  event.history.push(event.description, description);
}

/**
 * Handles the logic when an event option continues the event (stopPoint: false).
 * Generates the next stage of the event using LLM.
 */
async function handleEventContinuation(event: Event, option: EventOption) {
  const actingCharacter = gs.characters[event.participants[0]];
  const plot = `Previous event: ${event.description}\nPlayer choice: ${option.description}\nDescribe what happens next.`;

  const nextOptions = makeEventOptions(actingCharacter, gs.activity.activityType);
  const nextEventResult = await generateEventWithLLM(plot, nextOptions, [actingCharacter]);

  // Consolidate history and options
  const history = [...event.history, event.description, option.description];
  const finalOptions = nextOptions.map((opt, i) => ({
    ...opt,
    description: nextEventResult.options[i].description || opt.description,
  }));

  // Update global state with the new event stage
  gs.activity.event = {
    ...event,
    ...nextEventResult,
    history,
    options: finalOptions,
  };
}
