import { UiView, type UiState } from '../_model/model-ui';

export const uiState: UiState = $state({
  currentView: UiView.CurrentPlace,
  navigationVisible: false,
  battle: {
    selectedUnit: null,
    validTargets: null,
    abilityPending: null,
    spellPending: null,
    triggeredAbilityPending: null,
    selectedTargets: [],
    currentTargetIndex: 0,
    targetBeingSelected: null,
    attackingUnitId: null,
    graveyardModal: {
      visible: false,
      playerId: null,
    },
    deckModal: {
      visible: false,
      playerId: null,
    },
    currentEffectIndex: 0,
  },
  modal: {
    visible: false,
    title: '',
    body: '',
    onConfirm: undefined,
    onCancel: undefined,
  },
  cardFullOverlay: {
    visible: false,
    card: null,
  },
});
