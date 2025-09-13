import type { ActionAttempt } from '../_model/model-game';
import { gs } from '../_state/main.svelte';
import { ACTIONS } from './actions-map';

export function attemptAction(action: ActionAttempt): { success: boolean; isCritical: boolean } {
  console.log('attemptAction', action);
  if (!gs.chat) {
    console.log('Attempting actions but no chat');
    return { success: false, isCritical: false };
  }
  gs.chat.attemptedActionsResults = '';
  const outcome = ACTIONS[action.actionType].checkSuccess(action.args);
  if (outcome.success) {
    gs.chat.attemptedActionsResults += outcome.descriptionSuccess + '\n';
    if (outcome.isCritical) {
      gs.chat.attemptedActionsResults += 'Critical success!\n';
    }
  } else {
    gs.chat.attemptedActionsResults += outcome.descriptionFailure + '\n';
    if (outcome.isCritical) {
      gs.chat.attemptedActionsResults += 'Critical failure!\n';
    }
  }
  return outcome;
}
