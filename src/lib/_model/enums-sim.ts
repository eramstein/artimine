export enum DayPeriod {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Evening = 'evening',
}

export enum ItemType {
  Booster = 'booster',
  StarterDeck = 'starter deck',
  BoardGame = 'board game',
}

// activityPlans are long, they last for one time period
export enum ActivityType {
  Chill = 'Chilling',
  Gaming = 'Gaming',
  Work = 'Working',
  Study = 'Studying',
  Social = 'Socializing',
  Date = 'Going on a date',
  Tournament = 'Tournament',
}

export enum TournamentType {
  RoundRobin = 'RoundRobin', // every player plays against every other player
  Swiss = 'Swiss',
}

export enum TournamentStatus {
  Planned = 'Planned',
  PairingsPublished = 'PairingsPublished',
  RoundOngoing = 'RoundOngoing',
  Finished = 'Finished',
}

// actions are punctual. they are mapped to LLM tools and Sim functions
export enum ActionType {
  GeneralChallenge = 'generalChallenge',
  None = 'none',
  GoTo = 'goTo',
  StartGame = 'startGame',
  StartTrade = 'startTrade',
  ScheduleActivity = 'scheduleActivity',
}

export enum Difficulty {
  AutomaticSuccess = 'automaticSuccess',
  ExtremelyEasy = 'extremelyEasy',
  VeryEasy = 'veryEasy',
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  VeryHard = 'veryHard',
  ExtremelyHard = 'extremelyHard',
  Impossible = 'impossible',
}
