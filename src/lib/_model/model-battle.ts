import {
  CardColor,
  CardRarity,
  CardType,
  CounterType,
  TargetType,
  TriggerRange,
  TriggerType,
  UnitType,
} from './enums';

export interface BattleState {
  turn: number;
  isPlayersTurn: boolean;
  playerIdWon: number | null;
  players: Player[];
  units: UnitDeployed[];
}

export interface Player {
  id: number;
  isPlayer: boolean;
  name: string;
  mana: number;
  maxMana: number;
  life: number;
  hand: Card[];
  deck: Card[];
  graveyard: Card[];
  lands: Land[];
  colors: Partial<Record<CardColor, number>>;
  abilityUsed: boolean;
}

// CARD TEMPLATE INTERFACES (before the game started, the card itself)
export interface BaseCardTemplate {
  id: string;
  name: string;
  rarity: CardRarity;
  type: CardType;
  cost: number;
  colors: { color: CardColor; count: number }[];
}

export interface UnitCardTemplate extends BaseCardTemplate {
  power: number;
  maxHealth: number;
  keywords?: UnitKeywords;
  abilities?: Ability[];
  unitTypes?: UnitType[];
}

export interface SpellCardTemplate extends BaseCardTemplate {
  actions: ActionDefinition[];
}
export type CardTemplate = UnitCardTemplate | SpellCardTemplate;

// CARD INTERFACES (once the game started, drawn or in deck)
export interface BaseCard extends BaseCardTemplate {
  instanceId: string;
  ownerPlayerId: number;
}
export interface UnitCard extends UnitCardTemplate, BaseCard {}
export interface SpellCard extends SpellCardTemplate, BaseCard {}
export type Card = UnitCard | SpellCard;

// CARD DEPLOYED INTERFACES (for permanents, once on the board)
export interface BaseCardDeployed extends BaseCard {
  position: Position;
}

export interface Position {
  row: number;
  column: number;
}

export interface UnitDeployed extends UnitCard, BaseCardDeployed {
  health: number;
  hasAttacked: boolean;
  hasMoved: boolean;
  exhausted: boolean;
  statuses: UnitStatuses;
  untilEndOfTurn: UnitEndOfTurnEffects;
  staticModifiers: {
    source: { unitId: string; abilityName: string };
    permanent: boolean;
    keyword?: UnitKeywordDefinition;
    abilityName?: string;
    attack?: number;
  }[];
  counters: Partial<Record<CounterType, number>>;
}

export interface SpellCardDeployed extends SpellCard, BaseCardDeployed {
  remainingDuration?: number;
}

export type CardDeployed = UnitDeployed | SpellCardDeployed;

export interface LandTemplate {
  id: string;
  name: string;
  colors: { color: CardColor; count: number }[];
  health: number;
}

export interface Land extends LandTemplate {
  instanceId: string;
  ownerPlayerId: number;
  position: number;
}

export type UnitKeywordDefinition = {
  key: keyof UnitKeywords;
  value: boolean | number;
};

export interface UnitKeywords {
  ranged?: boolean;
  haste?: boolean;
  moveAndAttack?: boolean;
  retaliate?: number;
  armor?: number;
  resist?: number;
  poisonous?: number;
  regeneration?: number;
  trample?: boolean;
  zerk?: boolean;
}

export type UnitEndOfTurnEffects = UnitKeywords & {
  power?: number;
};

export interface UnitStatuses {
  poison?: number;
  mezz?: number;
  root?: number;
  stun?: number;
}

export interface Ability {
  actions: ActionDefinition[];
  trigger: Trigger;
  cost?: number;
  exhausts?: boolean;
}

export interface EffectArgs {
  unit: UnitDeployed;
  targets: EffectTargets[];
  triggerParams: any;
  player: Player;
}

export interface Trigger {
  type: TriggerType;
  range?: TriggerRange;
  staticRecompute?: TriggerType[];
  text?: string;
}

export interface TargetDefinition {
  type: TargetType;
  count?: number;
  text?: string;
}

export type EffectTargets = UnitDeployed[] | Position[] | Land[] | Player[] | Card[];

export type ActionDefinition = {
  effect: {
    name: string;
    args: Record<string, any>;
  };
  targets?: TargetDefinition[];
  text?: string;
};
