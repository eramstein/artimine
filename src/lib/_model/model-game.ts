import type { ActivityType, DayPeriod, ItemType } from './enums-sim';

export interface GameState {
  time: {
    day: number;
    period: DayPeriod;
  };
  characters: Record<string, Character>;
  player: Player;
  places: Place[];
  activity: Activity; // current activity
  activities: ActivityPlan[][]; // plan for future activities by days in future and day period
}

export interface Player extends Character {
  studyPoints: number;
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

export interface Activity {
  activityType: ActivityType;
  participants: string[]; // Character keys
}

export interface ActivityPlan {
  day: number;
  dayPeriod: DayPeriod;
  activity: Activity;
  place: number; // Place index
}
