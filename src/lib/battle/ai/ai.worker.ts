import { bs, populateBattleState } from '@/lib/_state/main.svelte';
import { uiState } from '@/lib/_state/state-ui.svelte';
import { nextTurn } from '../turn';

// Set headless mode for this worker singleton
uiState.isHeadless = true;

self.onmessage = (event: MessageEvent) => {
  const { type, snapshot } = event.data;

  if (type === 'EVALUATE_PASS_TURN') {
    // 1. Initialize local state with snapshot
    populateBattleState(snapshot);

    // 2. Perform the action
    nextTurn();

    // 3. Return the result
    self.postMessage({
      type: 'EVALUATE_RESULT',
      resultingState: JSON.parse(JSON.stringify(bs)),
    });
  }
};
