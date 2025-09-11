import type { ActionAttempt } from '../_model/model-game';
import { gs } from '../_state/main.svelte';
import { ACTIONS } from './actions-map';

export function attemptAction(action: ActionAttempt): boolean {
  console.log('attemptAction', action);
  if (!gs.chat) {
    console.log('Attempting actions but no chat');
    return false;
  }
  gs.chat.attemptedActionsResults = '';
  const outcome = ACTIONS[action.actionType].checkSuccess(action.args);
  gs.chat.attemptedActionsResults += outcome.description + '\n';
  return outcome.success;
}
