import type { Card, Player, Position, UnitCard } from '../_model';
import { bs } from '../_state';
import { onDeployUnit } from './listeners';
import { soundManager } from './sound';
import { makeDeployedUnit } from './unit';

export function getAllGraveyardsCards(): Card[] {
  return bs.players.flatMap((p) => p.graveyard);
}

export function reanimate(card: UnitCard, position: Position, reanimatorPlayerId: number) {
  const player = bs.players[card.ownerPlayerId];
  if (player) {
    player.graveyard.splice(player.graveyard.indexOf(card), 1);
    bs.units.push(makeDeployedUnit(card, position));
    const deployedUnit = bs.units[bs.units.length - 1];
    deployedUnit.ownerPlayerId = reanimatorPlayerId;
    soundManager.playDeploySound();
    onDeployUnit(deployedUnit);
  }
}

export function regrowCard(cardInstanceId: string, player: Player) {
  const card = player.graveyard.find((c) => c.instanceId === cardInstanceId);
  if (!card) return;
  player.graveyard = player.graveyard.filter((c) => c.instanceId !== cardInstanceId);
  player.hand.push(card);
}
