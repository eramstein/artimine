import type { ActionType, ActivityType, DayPeriod, ItemType } from './enums-sim';

export interface GameState {
  time: {
    day: number;
    period: DayPeriod;
  };
  characters: Record<string, Npc>;
  player: Player;
  places: Place[];
  activity: Activity; // current activity
  activities: ActivityPlan[][]; // plan for future activities by days in future and day period
  chat: ChatState | null;
}

export interface Player extends Character {
  studyPoints: number;
}

export interface Npc extends Character {
  relationSummary: string;
}

export interface Character {
  key: string;
  name: string;
  bio: string;
  place: number;
  collection: CardTuple[];
  decks: Deck[];
  cash: number;
  items: Item[];
}

export interface CardTuple {
  cardTemplateId: string;
  count: number;
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
  cards: CardTuple[];
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

export interface ChatState {
  characters: Npc[];
  history: ChatMessage[];
  summary: string;
  lastSummaryMessageIndex: number;
  memories: string;
  attemptedActionsResults: string;
}

export interface ChatMessage {
  role: string;
  content: string;
  displayLabel?: string; // just the raw message, without additional info intended for the LLM
}

export interface GroupActivityLog {
  id: string;
  activityType: ActivityType;
  participants: string[];
  location: string;
  day: number;
  summary: string;
}

export interface RelationshipSummaryUpdate {
  id: string;
  npc: string;
  description: string;
  day: number;
}

export interface ActionTypeDefinition {
  onSuccess: (args: any) => void;
  checkSuccess: (args: any) => { success: boolean; description: string };
  getLabel: (args: any) => string;
  description: string;
}

export interface ActionAttempt {
  actionType: ActionType;
  args: Record<string, any>;
}
