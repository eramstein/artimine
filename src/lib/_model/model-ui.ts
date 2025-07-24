import type {
  Ability,
  EffectTargets,
  SpellCard,
  TargetDefinition,
  UnitDeployed,
} from './model-battle';

export type UiState = {
  currentView: UiView;
  battle: {
    selectedUnit: UnitDeployed | null;
    validTargets: {
      units?: Record<string, boolean>;
      lands?: Record<string, boolean>;
      players?: Record<number, boolean>;
      cells?: Record<string, boolean>;
      cards?: Record<string, boolean>;
    } | null;
    abilityPending: { unit: UnitDeployed; ability: Ability } | null;
    spellPending: SpellCard | null;
    selectedTargets: EffectTargets[];
    currentTargetIndex: number;
    targetBeingSelected: TargetDefinition | null;
    attackingUnitId: string | null;
  };
  modal: {
    visible: boolean;
    title: string;
    body: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
};

export enum UiView {
  Battle = 'Battle',
}
