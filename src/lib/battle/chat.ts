import type { Card } from '../_model';
import { bs } from '../_state';
import { sendBattleEvent } from '../llm/battle-events';

export function onLargeCardPlayed(card: Card) {
  sendBattleEvent(
    `${card.name} was played by ${bs.players[card.ownerPlayerId].name}. It is a powerful card!`
  );
}

export function onBattleEnd() {
  const winningPlayer = bs.players[bs.playerIdWon!];
  sendBattleEvent(`${winningPlayer.name} has won the battle!`);
}
