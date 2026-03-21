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

export enum ActivityType {
  OldMemories = 'Old Memories',
  Chill = 'Chilling',
  Gaming = 'Gaming',
  Work = 'Working',
  Study = 'Studying',
  Social = 'Socializing',
  Date = 'Going on a date',
  Tournament = 'Tournament',
  Gift = 'Gift',
}

export enum TournamentType {
  RoundRobin = 'RoundRobin', // every player plays against every other player
  Swiss = 'Swiss',
}

export enum TournamentFormat {
  Constructed = 'Constructed', // players create their decks from their collections, all cards allowed
  Draft = 'Draft', // players build decks from 3 boosters
}

export enum TournamentStatus {
  Planned = 'Planned',
  Drafting = 'Drafting',
  DeckBuilding = 'DeckBuilding',
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
  AutomaticSuccess = 'automatic success',
  ExtremelyEasy = 'extremely easy',
  VeryEasy = 'very easy',
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  VeryHard = 'very hard',
  ExtremelyHard = 'extremely hard',
  Impossible = 'impossible',
}

// bonuses or extra abilities the player has with a given NPC
export enum NpcPerk {
  ExtraTrade = 'extra trades', // allows extra trades per period
}
