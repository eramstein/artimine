import { nextTurn } from '../turn';

export function playAiTurn() {
  window.setTimeout(() => {
    nextTurn();
    // TODO: play ai turn
  }, 1000);
}
