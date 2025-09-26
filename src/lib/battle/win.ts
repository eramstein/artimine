import type { Player } from '../_model';
import { bs } from '../_state';
import { recordBattleResult } from '../sim/ongoing-battle';
import { chatOnBattleEnd } from './chat';
import { getAiPlayer, getHumanPlayer } from './player';

export function checkIfPlayerLost(player: Player) {
  if (player.life <= 0) {
    bs.playerIdWon = player.id === 0 ? 1 : 0;
    endBattle();
  }
}

export function endBattle(concession: boolean = false) {
  if (concession) {
    bs.playerIdWon = getAiPlayer().id;
  }
  const playerPlayedCards = getPlayedCards(getHumanPlayer());
  const opponentPlayedCards = getPlayedCards(getAiPlayer());
  recordBattleResult(
    bs.playerIdWon === getHumanPlayer().id,
    playerPlayedCards,
    opponentPlayedCards
  );
  chatOnBattleEnd();
}

function getPlayedCards(player: Player) {
  return [
    ...player.hand,
    ...player.graveyard,
    ...bs.units.filter((unit) => unit.ownerPlayerId === player.id),
  ].map((card) => card.id);
}
