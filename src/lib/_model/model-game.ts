import type { DayPeriod } from './enums-sim';

export interface GameState {
  time: {
    day: number;
    period: DayPeriod;
  };
  characters: Record<string, Character>;
  player: Character;
  places: Place[];
}

export interface Character {
  key: string;
  name: string;
  place: number;
}

export interface Place {
  index: number;
  key: string;
  name: string;
  description: string;
}
