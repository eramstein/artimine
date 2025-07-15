import { CardColor, CardType } from './enums';

export interface BattleState {
  turn: number;
  isPlayersTurn: boolean;
  playerIdWon: number | null;
  players: Player[];
  units: UnitCardDeployed[];
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
}

// CARD TEMPLATE INTERFACES (before the game started, the card itself)
export interface BaseCardTemplate {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  colors: { color: CardColor; count: number }[];
}

export interface UnitCardTemplate extends BaseCardTemplate {
  power: number;
  maxHealth: number;
  keywords?: UnitKeywords;
}

export interface SpellCardTemplate extends BaseCardTemplate {
  effect: string;
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

export interface UnitCardDeployed extends UnitCard, BaseCardDeployed {
  health: number;
  hasAttacked: boolean;
  hasMoved: boolean;
  exhausted: boolean;
}

export interface SpellCardDeployed extends SpellCard, BaseCardDeployed {
  remainingDuration?: number;
}

export type CardDeployed = UnitCardDeployed | SpellCardDeployed;

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
  // poison?: number;
  // regeneration?: number;
}
