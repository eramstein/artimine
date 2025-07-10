import { CardColor } from './enums';

export interface BattleState {
  turn: number;
  isPlayersTurn: boolean;
  players: Player[];
  units: CardDeployed[];
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

export interface CardTemplate {
  id: string;
  name: string;
  cost: number;
  colors: { color: CardColor; count: number }[];
  power?: number;
  health?: number;
}

export interface Card extends CardTemplate {
  instanceId: string;
  ownerPlayerId: number;
}

export interface CardDeployed extends Card {
  position: { row: number; column: number };
  hasAttacked: boolean;
  hasMoved: boolean;
  exhausted: boolean;
}

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
