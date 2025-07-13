import type { Player, UnitCardDeployed } from '../_model';
import { bs } from '../_state';

export function damagePlayer(player: Player, damage: number) {
  player.life -= damage;
  if (player.life <= 0) {
    bs.playerIdWon = player.id === 0 ? 1 : 0;
  }
}

export function getOpposingPlayer(unit: UnitCardDeployed): Player {
  return unit.ownerPlayerId === 0 ? bs.players[1] : bs.players[0];
}
