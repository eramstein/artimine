import type { CardColor, Player, UnitDeployed } from '../_model';
import { bs } from '../_state';
import { drawCard } from './deck';

export function damagePlayer(player: Player, damage: number) {
  player.life -= damage;
  if (player.life <= 0) {
    bs.playerIdWon = player.id === 0 ? 1 : 0;
  }
}

export function getOpposingPlayer(unit: UnitDeployed): Player {
  return unit.ownerPlayerId === 0 ? bs.players[1] : bs.players[0];
}

export function isHumanPlayer(playerId: number): boolean {
  return playerId === 0;
}

export function incrementColor(player: Player, color: CardColor, value = 1) {
  if (!player.colors[color] || player.abilityUsed) {
    return;
  }
  player.colors[color] += value;
  player.abilityUsed = true;
}

export function useDrawAbility(player: Player) {
  if (player.mana < 1 || player.abilityUsed) {
    return;
  }
  player.mana -= 1;
  drawCard(player);
  player.abilityUsed = true;
}
