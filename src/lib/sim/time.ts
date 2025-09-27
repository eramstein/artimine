import { DayPeriod } from '../_model';
import { gs } from '../_state/main.svelte';
import { dayNames } from './schedule';

export const dayPeriodIndexes = {
  [DayPeriod.Morning]: 0,
  [DayPeriod.Afternoon]: 1,
  [DayPeriod.Evening]: 2,
};

export function getDayNumberFromWeekday(weekday: string): number {
  const targetWeekday = dayNames.findIndex((d) => d === weekday);
  if (!targetWeekday) {
    return 0;
  }
  // we assume day 0 is Satudray (dayNames[0])
  const currentWeekday = gs.time.day % 7;
  if (targetWeekday < currentWeekday) {
    return gs.time.day + 7 - currentWeekday + targetWeekday;
  }
  return gs.time.day + targetWeekday - currentWeekday;
}

export function isTimePeriodBefore(dayPeriod1: DayPeriod, dayPeriod2: DayPeriod) {
  return dayPeriodIndexes[dayPeriod1] < dayPeriodIndexes[dayPeriod2];
}

export function isTimePeriodBeforeOrNow(dayPeriod1: DayPeriod, dayPeriod2: DayPeriod) {
  return dayPeriodIndexes[dayPeriod1] <= dayPeriodIndexes[dayPeriod2];
}
