import { type Activity, ActivityType, DayPeriod, type Place } from '../_model';
import { gs } from '../_state/main.svelte';
import { endPlayerChat } from '../llm';
import { autoResolveActivity } from './activity';

const dayPeriodIndexes = {
  [DayPeriod.Morning]: 0,
  [DayPeriod.Afternoon]: 1,
  [DayPeriod.Evening]: 2,
};

const dayPeriods = [DayPeriod.Morning, DayPeriod.Afternoon, DayPeriod.Evening];

export const dayNames = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export function scheduleActivity(
  activity: Activity,
  day: number,
  dayPeriod: DayPeriod,
  place: Place
) {
  const dayPeriodIndex = dayPeriodIndexes[dayPeriod];
  gs.activities[day][dayPeriodIndex] = {
    activity: activity,
    day: day,
    dayPeriod: dayPeriod,
    place: place.index,
  };
}

export async function skipTo(day: number, dayPeriod: DayPeriod) {
  const activityPlan = gs.activities[day][dayPeriodIndexes[dayPeriod]];
  await endPlayerChat();
  // auto-resolve activities
  gs.activities
    .filter((_, d) => d <= day)
    .forEach((dayActivities) => {
      dayActivities.forEach((activityPlan) => {
        autoResolveActivity(activityPlan.activity);
        if (activityPlan.day === day && activityPlan.dayPeriod === dayPeriod) return;
      });
    });
  // fill schedule for next days
  gs.time.day += day;
  gs.time.period = dayPeriod;
  gs.activities = gs.activities.slice(day);
  fillDefaultActivities();
  // update activity, time and schedule
  if (!activityPlan) return;
  gs.activity = activityPlan.activity;
  gs.player.place = activityPlan.place;
  activityPlan.activity.participants.forEach((participant) => {
    gs.characters[participant].place = activityPlan.place;
  });
}

export function fillDefaultActivities() {
  const goblinCaveIndex = gs.places.find((p) => p.key === 'goblin_counter')!.index;
  const bedroomIndex = gs.places.find((p) => p.key === 'bedroom')!.index;
  const uniCourtyardIndex = gs.places.find((p) => p.key === 'uni_courtyard')!.index;
  let weekDay = 0;
  for (let day = 0; day < 7; day++) {
    weekDay = (gs.time.day + day) % 7;
    if (!gs.activities[day]) {
      gs.activities[day] = [];
    }
    for (let dayPeriod = 0; dayPeriod < 3; dayPeriod++) {
      if (gs.activities[day][dayPeriod]) continue;
      let activityType: ActivityType = ActivityType.Chill;
      let participants: string[] = [];
      let place: number = bedroomIndex;
      // not week end
      if (weekDay > 1) {
        if (dayPeriod === 0) {
          activityType = ActivityType.Study;
          place = uniCourtyardIndex;
        }
        if (dayPeriod === 1) {
          activityType = ActivityType.Study;
          place = uniCourtyardIndex;
        }
      }
      // obligatory saturday afternoon gaming
      if (weekDay === 0 && dayPeriod === 1) {
        activityType = ActivityType.Gaming;
        participants = ['the-dude', 'emma', 'henry', 'molly', 'ousmane'];
        place = goblinCaveIndex;
      }
      gs.activities[day][dayPeriod] = {
        activity: {
          activityType: activityType,
          participants: participants,
        },
        day: day,
        dayPeriod: dayPeriods[dayPeriod],
        place,
      };
    }
  }
}
