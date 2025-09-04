import type { DayPeriod } from './enums-sim';

export interface GameState {
  time: {
    day: number;
    period: DayPeriod;
  };
  characters: Record<string, Character>;
  player: Character;
  places: Place[];
  collection: {
    cardTemplateId: string;
    count: number;
  }[];
  decks: Deck[];
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

export interface Deck {
  key: string;
  name: string;
  cards: {
    cardTemplateId: string;
    count: number;
  }[];
  lands: string[];
}
