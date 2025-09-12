export enum DayPeriod {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Evening = 'evening',
}

export enum ItemType {
  Booster = 'booster',
  BoardGame = 'board game',
}

// activities are long, they last for one time period
export enum ActivityType {
  Chill = 'Chilling',
  Gaming = 'Gaming',
  Work = 'Working',
  Study = 'Studying',
  Social = 'Socializing',
  Date = 'Going on a date',
}

// actions are punctual. they are mapped to LLM tools and Sim functions
export enum ActionType {
  None = 'none',
  GoTo = 'goTo',
  StartGame = 'startGame',
  StartTrade = 'startTrade',
  ScheduleActivity = 'scheduleActivity',
}
