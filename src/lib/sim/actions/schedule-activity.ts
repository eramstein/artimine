import { ActivityType, DayPeriod, type ActionTypeDefinition } from '@/lib/_model';
import { gs } from '@/lib/_state';
import { recordActionInChat } from '@/lib/llm/action';
import { getCharactersFromNames, getKeysFromNames } from '../character';
import { checkActionSuccess } from '../roll';
import { scheduleActivity } from '../schedule';
import { getDayNumberFromWeekday } from '../time';

const defaultDay = 'Sunday';
const defaultTime = DayPeriod.Afternoon;

export const scheduleActivityAction: ActionTypeDefinition = {
  onSuccess: ({
    people,
    destination,
    activityType,
    day,
    time,
  }: {
    people: string[];
    destination: string;
    activityType: string;
    day: string;
    time: DayPeriod;
  }) => {
    console.log('ScheduleActivity', { people, destination, activityType, day, time });
    const participants = getKeysFromNames(people);
    const activityTypeEnum = ActivityType[activityType as keyof typeof ActivityType];
    const dayNumber = getDayNumberFromWeekday(day || defaultDay);
    const dayPeriod = time ?? defaultTime;
    const place = gs.places.find((p) => p.name === destination);
    if (!place) {
      console.log('Destination not found');
      return;
    }
    scheduleActivity({ activityType: activityTypeEnum, participants }, dayNumber, dayPeriod, place);
    recordActionInChat(
      `${gs.player.name} and ${people.join(', ')} will ${activityType} at ${destination} at ${time ?? defaultTime}`
    );
  },
  checkSuccess: ({ people, destination, activityType, day, time }) =>
    rollCheckSuccess(people, activityType, destination, day, time),
  description: 'Schedule an activity together',
  getLabel: ({
    destination,
    activityType,
    day,
    time,
  }: {
    destination: string;
    activityType: string;
    day: string;
    time: string;
  }) => {
    return `${activityType} at ${destination} at ${time ?? defaultTime} on ${day ?? defaultDay}`;
  },
};

const baseDifficulty = {
  [ActivityType.Chill]: 5,
  [ActivityType.Study]: 5,
  [ActivityType.Work]: 5,
  [ActivityType.Social]: 5,
  [ActivityType.Date]: 20,
  [ActivityType.Gaming]: 5,
};

function rollCheckSuccess(
  people: string[],
  activityType: string,
  destination: string,
  day: string,
  time: DayPeriod
): {
  success: boolean;
  isCritical: boolean;
  descriptionSuccess: string;
  descriptionFailure: string;
} {
  const participants = getCharactersFromNames(people);
  const difficulty = baseDifficulty[activityType as keyof typeof baseDifficulty];
  let acceptedCount = 0;
  let criticalCount = 0;

  participants.forEach((npc) => {
    let adjustedDifficulty = difficulty;
    switch (activityType) {
      case ActivityType.Date:
        adjustedDifficulty -= npc.relationValues.love * 2;
        break;
      default:
        adjustedDifficulty -= npc.relationValues.friendship * 2;
        break;
    }
    const outcome = checkActionSuccess('charisma', adjustedDifficulty);
    if (outcome.success) {
      acceptedCount++;
    }
    if (outcome.isCritical) {
      criticalCount++;
    }
  });

  const isCritical =
    criticalCount === people.length || (people.length > 3 && criticalCount >= people.length - 1);

  return {
    success:
      acceptedCount === people.length || (people.length > 3 && acceptedCount >= people.length - 1),
    isCritical,
    descriptionSuccess: `${people.join(', ')} agreed to ${activityType} at ${destination} at ${time ?? defaultTime} on ${day ?? defaultDay}`,
    descriptionFailure: `${people.join(', ')} did NOT agree to ${activityType} at ${destination} at ${time ?? defaultTime} on ${day ?? defaultDay}`,
  };
}
