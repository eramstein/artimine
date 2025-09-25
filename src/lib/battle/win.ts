import type { Player } from '../_model';
import { bs } from '../_state';
import { recordBattleResult } from '../sim/ongoing-battle';
import { chatOnBattleEnd } from './chat';

export function checkIfPlayerLost(player: Player) {
  if (player.life <= 0) {
    bs.playerIdWon = player.id === 0 ? 1 : 0;
    recordBattleResult(bs.playerIdWon === player.id);
    chatOnBattleEnd();
  }
}
