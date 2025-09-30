import type { Npc } from '../_model/model-game';
import { UiView, type UiState } from '../_model/model-ui';
import { initPlayerChat } from '../llm/chat';

export const uiState: UiState = $state({
  currentView: UiView.CurrentPlace,
  navigationVisible: false,
  selectedCharacterKey: null,
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
    playedSpellId: null,
    playedSpellTargets: null,
    colorBeingIncremented: null,
    graveyardModal: {
      visible: false,
      playerId: null,
    },
    deckModal: {
      visible: false,
      playerId: null,
    },
    currentEffectIndex: 0,
    displayChat: false,
  },
  collection: {
    editedDeckKey: null,
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
  confirmPopover: {
    visible: false,
    title: '',
    body: '',
    anchorEl: null as unknown as HTMLElement | null,
    onConfirm: undefined,
    onCancel: undefined,
  },
  deckSelectionModal: {
    visible: false,
    foeKey: null,
  },
  shopModal: {
    visible: false,
    placeKey: null,
  },
  boosterModal: {
    visible: false,
    cards: null,
  },
  chat: {
    isStreaming: false,
    streamingContent: '',
  },
  saveManagerModal: {
    visible: false,
  },
  tradingWith: null,
  rollResults: [],
});

export function addRollResult(result: {
  success: boolean;
  isCritical: boolean;
  roll: number;
  attribute: string;
  difficulty: number;
}) {
  uiState.rollResults.push(result);
}

export async function initTrade(partner: Npc) {
  uiState.tradingWith = partner.key;
  await initPlayerChat([partner]);
  uiState.currentView = UiView.Trade;
}
