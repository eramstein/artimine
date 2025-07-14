import type { BattleState, UnitCard, UnitCardDeployed } from '@/lib/_model';

export interface AiPersona {
  selectActionType(state: BattleState, possibleActions: PossibleActions): ActionType | null;
  deploy(state: BattleState, deployableUnits: UnitCard[]): void;
  move(state: BattleState, unitsWhoCanMove: UnitCardDeployed[]): void;
  attack(state: BattleState, unitsWhoCanAttack: UnitCardDeployed[]): void;
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
  unitsWhoCanAttack: UnitCardDeployed[];
  unitsWhoCanMove: UnitCardDeployed[];
}
