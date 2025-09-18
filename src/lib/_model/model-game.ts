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
  attributes: CharacterAttributes;
  studyPoints: number;
}

export interface Npc extends Character {
  relationSummary: string;
  relationValues: RelationValues;
  chatInitiation?: string; // the NPC has something to say
}

export interface RelationValues {
  friendship: number; // -10 to 10
  love: number; // -10 to 10
  respect: number; // -10 to 10
}

export interface CharacterAttributes {
  intelligence: number; // 0 to 10
  charisma: number; // 0 to 10
  vitality: number; // 0 to 10
  dexterity: number; // 0 to 10
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
  onSuccess?: (args: any, isCritical?: boolean) => void;
  onFailure?: (args: any, isCritical?: boolean) => void;
  checkSuccess: (args: any) => {
    success: boolean;
    isCritical: boolean;
    descriptionSuccess: string;
    descriptionFailure: string;
  };
  getLabel: (args: any) => string;
  description: string;
}

export interface ActionAttempt {
  actionType: ActionType;
  args: Record<string, any>;
}
