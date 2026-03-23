import { config } from '../_config';
import {
  ActivityType,
  DayPeriod,
  type Activity,
  type ActivityPlan,
  type Npc,
  type RelationValues,
} from '../_model';
import { gs } from '../_state';
import { clamp, getRandomFromArray, getRandomInteger } from '../_utils/random';

export function updateNpcRelationValue(npc: Npc, relation: keyof RelationValues, value: number) {
  npc.relationValues[relation] = clamp(
    npc.relationValues[relation] + value,
    -config.opinionMaxValue,
    config.opinionMaxValue
  );
}

export function makeNpcInvitations() {
  Object.values(gs.characters).forEach((character) => {
    if (Math.random() < 0.0) return;

    const possibleActivityTypes = Object.keys(unlockedActivities).filter((activityType) => {
      const activity = unlockedActivities[activityType as ActivityType];
      return (
        activity &&
        character.relationValues[activity.relation] >= activity.minVal &&
        (!activity.limitedToChars || activity.limitedToChars.includes(character.key))
      );
    });

    if (!possibleActivityTypes.length) return;

    const selectedActivityType = getRandomFromArray(possibleActivityTypes) as ActivityType;
    const activity: Activity = {
      activityType: selectedActivityType,
      participants: [character.key],
    };

    const place = getRandomFromArray(placesByActivityType[selectedActivityType]!);
    const activityPlan: ActivityPlan = {
      day: gs.time.day + getRandomInteger(1, 7),
      dayPeriod: getRandomFromArray(Object.values(DayPeriod)),
      activity,
      place: gs.places.findIndex((p) => p.key === place),
    };
    character.invitation = activityPlan;

    console.log('character.invitation', character.invitation);
  });
}

const unlockedActivities: Partial<
  Record<
    ActivityType,
    { relation: keyof RelationValues; minVal: number; limitedToChars?: string[] }
  >
> = {
  [ActivityType.Gaming]: { relation: 'friendship', minVal: 3 },
  [ActivityType.Study]: { relation: 'respect', minVal: 3, limitedToChars: ['molly', 'henry'] },
  [ActivityType.Social]: { relation: 'friendship', minVal: 1 },
  [ActivityType.Date]: { relation: 'love', minVal: 5 },
};

const placesByActivityType: Partial<Record<ActivityType, string[]>> = {
  [ActivityType.Gaming]: ['bedroom', 'goblin_counter'],
  [ActivityType.Study]: ['uni_courtyard'],
  [ActivityType.Social]: ['uni_cafeteria', 'chez_raoul', 'salon_de_the', 'le_chat_noir'],
  [ActivityType.Date]: ['le_chat_noir', 'salon_de_the'],
};
