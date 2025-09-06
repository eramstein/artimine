import type { DayPeriod, ItemType } from './enums-sim';

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
  collection: {
    cardTemplateId: string;
    count: number;
  }[];
  decks: Deck[];
  cash: number;
  items: Item[];
}

export interface Place {
  index: number;
  key: string;
  name: string;
  description: string;
  shopInventory?: ItemDefinition[];
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

export interface ItemDefinition {
  key: string;
  name: string;
  type: ItemType;
  variant: any;
  price: number;
}

export interface Item extends ItemDefinition {
  instanceId: string;
  ownerId: string; // Character key
}
