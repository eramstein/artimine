import type { Card, Land } from '../_model';
import { bs, gs } from '../_state';
import { sendBattleEvent } from '../llm/battle-events';
import { isHumanPlayer } from './player';

export function chatOnLargeCardPlayed(card: Card) {
  sendBattleEvent(
    `${card.name} was played by ${bs.players[card.ownerPlayerId].name}. It is a powerful card!`
  );
}

export function chatOnLandDestroyed(land: Land) {
  const playerName = isHumanPlayer(land.ownerPlayerId)
    ? gs.player.name
    : gs.chat?.characters[0]?.name;
  sendBattleEvent(`${playerName} land ${land.name} was destroyed. Their hero is now exposed!`);
}

export function chatOnBattleEnd() {
  const winningPlayer = isHumanPlayer(bs.playerIdWon!)
    ? gs.player.name
    : gs.chat?.characters[0]?.name;
  sendBattleEvent(`${winningPlayer} has won the game!`);
}
