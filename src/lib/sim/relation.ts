import { config } from '../_config';
import {
  ActivityType,
  DayPeriod,
  NpcPerk,
  RelationTag,
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

export function updateNpcRelationTag(npc: Npc, tag: RelationTag) {
  if (npc.relationTags.includes(tag)) return;
  npc.relationTags.push(tag);
  // first time a tag is added, unlock perks
  switch (tag) {
    case RelationTag.BestFriend:
      npc.perks[NpcPerk.ExtraTrade] = (npc.perks[NpcPerk.ExtraTrade] || 0) + 1;
      npc.perks[NpcPerk.Team] = 1;
      break;
    case RelationTag.Mentor:
      npc.perks[NpcPerk.Team] = 1;
      break;
    default:
      break;
  }
}

/*
 ** Updates npc relation tags based on current activity and relation values
 ** If player confirmation is required, don't do the update yet, return the tag
 */
export function checkForRelationChange(npc: Npc, activityType: ActivityType): RelationTag | null {
  let tag = null;
  switch (activityType) {
    case (ActivityType.Gaming, ActivityType.Study):
      if (npc.relationValues.friendship < -2 && npc.relationValues.respect > 8)
        tag = RelationTag.Rival;
      if (npc.relationValues.friendship > 0 && npc.relationValues.respect > 9)
        tag = RelationTag.Mentor;
      break;
    case ActivityType.Social:
      if (npc.relationValues.friendship > 9) tag = RelationTag.BestFriend;
      break;
    case ActivityType.Date:
      if (npc.relationValues.love > 8) tag = RelationTag.Lover;
      break;
    default:
      break;
  }
  if (!tag) return null;
  return tag;
}

export function makeNpcInvitations() {
  Object.values(gs.characters).forEach((character) => {
    if (Math.random() < 0.5) return;

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
