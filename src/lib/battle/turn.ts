import type { Player } from '../_model';
import { bs } from '../_state';
import { playAiTurn } from './ai/ai';
import { drawCard } from './deck';

export function nextTurn() {
  console.log('next turn');
  bs.turn++;
  bs.isPlayersTurn = !bs.isPlayersTurn;
  const player = bs.isPlayersTurn ? bs.players[0] : bs.players[1];
  initPlayerTurn(player);
  console.log('isPlayersTurn', bs.isPlayersTurn);
  if (!bs.isPlayersTurn) {
    playAiTurn();
  }
}

function initPlayerTurn(player: Player) {
  player.maxMana++;
  player.mana = player.maxMana;
  resetUnits(player);
  drawCard(player);
}

function resetUnits(player: Player) {
  bs.units
    .filter((unit) => unit.ownerPlayerId === player.id)
    .forEach((unit) => {
      unit.hasAttacked = false;
      unit.hasMoved = false;
      unit.exhausted = false;
    });
}
