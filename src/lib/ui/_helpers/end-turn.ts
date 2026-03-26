import { bs, saveStateToLocalStorage } from '../../_state';
import { uiState } from '../../_state/state-ui.svelte';
import { nextTurn } from '../../battle/turn';

export function handleEndTurn() {
  saveStateToLocalStorage();
  if (bs.players[0].abilityUsed) {
    nextTurn();
  } else {
    // Show confirmation modal
    uiState.modal = {
      visible: true,
      title: 'End Turn?',
      body: "You haven't used your player ability this turn. Are you sure you want to end your turn?",
      onConfirm: () => {
        nextTurn();
      },
    };
  }
}
