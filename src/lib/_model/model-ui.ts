import type { Ability, Position, SpellCard, Target, UnitDeployed } from './model-battle';

export type UiState = {
  currentView: UiView;
  battle: {
    selectedUnit: UnitDeployed | null;
    validTargets: {
      units?: Record<string, boolean>;
      lands?: Record<string, boolean>;
      players?: Record<number, boolean>;
      moves?: Record<string, boolean>;
    } | null;
    abilityPending: { unit: UnitDeployed; ability: Ability } | null;
    spellPending: SpellCard | null;
    selectedTargets: UnitDeployed[] | Position[];
    targetBeingSelected: Target | null;
    attackingUnitId: string | null;
  };
};

export enum UiView {
  Battle = 'Battle',
}
