import { TournamentStatus } from '../_model/enums-sim';
import type { Npc } from '../_model/model-game';
import { UiView, type UiState } from '../_model/model-ui';
import { recordActionInChat } from '../llm/action';
import { initPlayerChat } from '../llm/chat';
import { gs } from './main.svelte';

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
    playedSpellId: null,
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
  console.log('addRollResult', result);
  uiState.rollResults.push(result);
}

export async function initTrade(partner: Npc) {
  uiState.tradingWith = partner.key;
  await initPlayerChat([partner]);
  uiState.currentView = UiView.Trade;
}

export async function startGame(foe: Npc) {
  uiState.deckSelectionModal.foeKey = foe.key;
  uiState.deckSelectionModal.visible = true;
  if (gs.activity.tournament) {
    gs.activity.tournament.status = TournamentStatus.RoundOngoing;
  }
  await initPlayerChat([foe]);
  recordActionInChat(`${foe.name} and ${gs.player.name} have started a game of Hordes cards.`);
}
