import { DayPeriod } from '../_model/enums-sim';

export const config = {
  // sim
  startDate: '1993-04-01',
  startDayPeriod: DayPeriod.Afternoon,
  attributesMaxValue: 10,
  opinionMaxValue: 20,
  maxTradesPerPeriod: 1,
  // battle
  initialMana: 2,
  initialHandSize: 7,
  initialLife: 10,
  boardRows: 4,
  boardColumns: 4,
  aiActionInterval: 1000,
};
