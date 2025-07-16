import type { BattleState, UnitCard, UnitDeployed } from '@/lib/_model';

export interface AiPersona {
  selectActionType(state: BattleState, possibleActions: PossibleActions): ActionType | null;
  deploy(state: BattleState, deployableUnits: UnitCard[]): void;
  move(state: BattleState, unitsWhoCanMove: UnitDeployed[]): void;
  attack(state: BattleState, unitsWhoCanAttack: UnitDeployed[]): void;
}

export enum ActionType {
  Deploy = 'Deploy',
  Attack = 'Attack',
  Move = 'Move',
}

export enum PersonaType {
  Aggro = 'Aggro',
}

export interface PossibleActions {
  count: number;
  deployableUnits: UnitCard[];
  unitsWhoCanAttack: UnitDeployed[];
  unitsWhoCanMove: UnitDeployed[];
}
