export interface BattleState {
  turn: number;
  players: Player[];
}

export interface Player {
  name: string;
  mana: number;
  maxMana: number;
}
