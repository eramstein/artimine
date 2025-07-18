import { UiView, type UiState } from '../_model/model-ui';

export const uiState: UiState = $state({
  currentView: UiView.Battle,
  battle: {
    selectedUnit: null,
    validTargets: null,
    abilityPending: null,
    selectedTargets: [],
    targetBeingSelected: null,
    attackingUnitId: null,
  },
});
