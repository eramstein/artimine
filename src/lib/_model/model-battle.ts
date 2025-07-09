export interface BattleState {
  turn: number;
  players: Player[];
  units: CardDeployed[];
}

export interface Player {
  isPlayer: boolean;
  name: string;
  mana: number;
  maxMana: number;
  life: number;
  hand: Card[];
  deck: Card[];
  graveyard: Card[];
}

export interface CardTemplate {
  id: string;
  name: string;
  cost: number;
  power: number;
  health: number;
}

export interface Card extends CardTemplate {
  instanceId: string;
  owner: Player;
}

export interface CardDeployed extends Card {
  position: { row: number; column: number };
}
