import type { SpellCard, UnitCard, UnitDeployed } from '@/lib/_model';

export interface AiPersona {
  executeAction(possibleActions: PossibleActions): void;
}

export enum PersonaType {
  Normal = 'Normal',
  Aggro = 'Aggro',
}

export interface PossibleActions {
  count: number;
  playableSpells: SpellCard[];
  deployableUnits: UnitCard[];
  unitsWhoCanAttack: UnitDeployed[];
  unitsWhoCanMove: UnitDeployed[];
  playerAbility: boolean;
}
