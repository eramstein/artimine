import { gs } from '../_state/main.svelte';
import { dayNames } from './schedule';

export function getDayNumberFromWeekday(weekday: string): number {
  const targetWeekday = dayNames.find((d) => d === weekday);
  if (!targetWeekday) {
    return 0;
  }
  const currentWeekday = dayNames[gs.time.day % 7];
  if (targetWeekday < currentWeekday) {
    return gs.time.day + 7 - dayNames.indexOf(currentWeekday) + dayNames.indexOf(targetWeekday);
  }
  return gs.time.day + dayNames.indexOf(targetWeekday) - dayNames.indexOf(currentWeekday);
}
