import type { UnitDeployed } from './model-battle';

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
  };
};

export enum UiView {
  Battle = 'Battle',
}
