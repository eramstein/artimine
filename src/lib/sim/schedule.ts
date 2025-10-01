import {
  type Activity,
  ActivityType,
  DayPeriod,
  type Place,
  type Tournament,
  TournamentType,
} from '../_model';
import { gs } from '../_state/main.svelte';
import { endPlayerChat } from '../llm';
import { autoResolveActivity } from './activity';
import { adjustNpcDecks, expandNpcCollections } from './npc';
import { dayPeriodIndexes, isTimePeriodBefore } from './time';
import { getTournament } from './tournament';

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
  const dayIndex = getScheduleIndexOfDay(day);
  if (!gs.activityPlans[dayIndex]) {
    console.log('day not found, adding planning', day);
    fillDefaultActivities(day);
  }
  gs.activityPlans[dayIndex][dayPeriodIndex] = {
    activity: activity,
    day: day,
    dayPeriod: dayPeriod,
    place: place.index,
  };
}

export async function passTimeUntil(day: number, dayPeriod: DayPeriod) {
  await endPlayerChat();
  // auto-resolve activityPlans
  gs.activityPlans
    .filter((_, d) => d <= day)
    .forEach((dayActivities) => {
      dayActivities.forEach((activityPlan) => {
        if (
          activityPlan.resolved ||
          (activityPlan.day === day + gs.time.day &&
            !isTimePeriodBefore(activityPlan.dayPeriod, dayPeriod))
        ) {
          return;
        }
        activityPlan.resolved = true;
        autoResolveActivity(activityPlan.activity);
        // weekly NPC updates
        if (activityPlan.day % 7 === 0 && activityPlan.dayPeriod === DayPeriod.Afternoon) {
          expandNpcCollections();
          adjustNpcDecks();
        }
      });
    });
  // clean up passed schedule
  gs.activityPlans = gs.activityPlans.slice(day);
  // fill schedule for next days
  gs.time.day += day;
  gs.time.period = dayPeriod;
  fillDefaultActivities(gs.time.day + 14);
  // update activity, time and schedule
  const activityPlan = gs.activityPlans[0][dayPeriodIndexes[gs.time.period]];
  if (!activityPlan) return;
  gs.activity = activityPlan.activity;
  gs.player.place = activityPlan.place;
  activityPlan.activity.participants.forEach((participant) => {
    if (gs.characters[participant]) {
      gs.characters[participant].place = activityPlan.place;
    }
  });
}

export function fillDefaultActivities(untilDay: number) {
  const fromDay = getLastScheduledDay() + 1;
  const toDay = untilDay || fromDay + 7;
  const goblinCaveIndex = gs.places.find((p) => p.key === 'goblin_counter')!.index;
  const bedroomIndex = gs.places.find((p) => p.key === 'bedroom')!.index;
  const uniCourtyardIndex = gs.places.find((p) => p.key === 'uni_courtyard')!.index;
  let weekDay = 0;
  for (let day = fromDay; day < toDay; day++) {
    weekDay = day % 7;
    gs.activityPlans.push([]);
    for (let dayPeriod = 0; dayPeriod < 3; dayPeriod++) {
      let activityType: ActivityType = ActivityType.Chill;
      let participants: string[] = [];
      let place: number = bedroomIndex;
      let tournament: Tournament | undefined;
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
      // friday evening local tournament
      if (weekDay === 6 && dayPeriod === 2) {
        activityType = ActivityType.Tournament;
        participants = ['player', 'the-dude', 'emma', 'henry', 'molly', 'ousmane'];
        place = goblinCaveIndex;
        tournament = getTournament(participants, TournamentType.Swiss, 3);
      }
      gs.activityPlans[gs.activityPlans.length - 1][dayPeriod] = {
        activity: {
          activityType: activityType,
          participants: participants,
          tournament: tournament,
        },
        day: day,
        dayPeriod: dayPeriods[dayPeriod],
        place,
      };
    }
  }
}

function getLastScheduledDay() {
  if (gs.activityPlans.length === 0 || gs.activityPlans[0].length === 0) return -1;
  return gs.activityPlans[gs.activityPlans.length - 1][0].day;
}

function getScheduleIndexOfDay(day: number) {
  return gs.activityPlans.findIndex((d) => d[0].day === day);
}
