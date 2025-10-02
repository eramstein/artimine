import type {
  ActionType,
  ActivityType,
  DayPeriod,
  ItemType,
  TournamentStatus,
  TournamentType,
} from './enums-sim';

export interface GameState {
  time: {
    day: number;
    period: DayPeriod;
  };
  characters: Record<string, Npc>;
  player: Player;
  places: Place[];
  activity: Activity; // current activity
  activityPlans: ActivityPlan[][]; // plan for future activityPlans by days in future and day period
  chat: ChatState | null;
  ongoingBattle: OngoingBattle | null;
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

export interface Player extends Character {
  attributes: CharacterAttributes;
  studyPoints: number;
}

export interface Npc extends Character {
  relationSummary: string;
  relationValues: RelationValues;
  chatInitiation?: string; // the NPC has something to say
  period: {
    interactionsSummary: string;
    charismaRoll?: number; // player's charisma roll for the period, influences NPC behavior
    trades: number; // how many cards the NPC has traded with the player this period
  };
}

export interface RelationValues {
  friendship: number;
  love: number;
  respect: number;
}

export interface CharacterAttributes {
  intelligence: number; // 0 to 10
  charisma: number; // 0 to 10
  vitality: number; // 0 to 10
  dexterity: number; // 0 to 10
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
  record: {
    wins: number;
    losses: number;
    cardResults: Record<string, number>; // card key to win record
  };
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
  tournament?: Tournament;
}

export interface ActivityPlan {
  day: number;
  dayPeriod: DayPeriod;
  activity: Activity;
  place: number; // Place index
  resolved?: boolean;
}

export interface ChatState {
  characters: Npc[];
  history: ChatMessage[];
  summary: string;
  lastSummaryMessageIndex: number;
  attemptedActionsResults: string;
}

export interface ChatMessage {
  role: string;
  content: string;
  displayLabel?: string; // just the raw message, without additional info intended for the LLM
  fromEngine?: boolean; // distinguishes auto generated messages from player messages
}

export interface GroupActivityLog {
  id: string;
  activityType: ActivityType;
  participants: string[];
  location: string;
  day: number;
  summary: string;
  embedding: number[];
}

export interface WorldFact {
  id: string;
  description: string;
  embedding: number[];
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

export interface Tournament {
  players: string[]; // character keys
  winner?: string;
  status: TournamentStatus;
  tournamentType: TournamentType;
  rounds?: number; // for swiss tournament, how many rounds will be played
  playedRounds: number; // for swiss tournament, how many rounds have been played
  rankings: Record<string, number>; // character key to current points
  wonAgainst: Record<string, string[]>; // character key to array of character keys it has won against - used for breaking ties
  tiebreakers: Record<string, number>; // character key to current tiebreaker points
  pairings: Record<string, string>; // character keys, who plays who in current round
  remainingMatches: Record<string, string[]>; // for mini tournament, who the player still has to play with
}

export interface OngoingBattle {
  opponentKey: string;
  deckNames: {
    player: string;
    opponent: string;
  };
}
