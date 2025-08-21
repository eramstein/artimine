import type {
  Ability,
  Card,
  EffectTargets,
  SpellCard,
  TargetDefinition,
  UnitDeployed,
} from './model-battle';

export type UiState = {
  currentView: UiView;
  navigationVisible: boolean;
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
    triggeredAbilityPending: { unit: UnitDeployed; ability: Ability; triggerParams: any } | null;
    selectedTargets: EffectTargets[][];
    currentEffectIndex: number;
    currentTargetIndex: number;
    targetBeingSelected: TargetDefinition | null;
    attackingUnitId: string | null;
    graveyardModal: {
      visible: boolean;
      playerId: number | null;
    };
  };
  modal: {
    visible: boolean;
    title: string;
    body: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
  cardFullOverlay: {
    visible: boolean;
    card: Card | null;
  };
};

export enum UiView {
  Battle = 'Battle',
  CardBuilder = 'CardBuilder',
  Analytics = 'Analytics',
}
