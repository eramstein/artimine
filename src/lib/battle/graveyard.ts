import { bs } from '../_state';
import type { Card, Position, UnitCard } from '../_model';
import { makeDeployedUnit } from './unit';
import { soundManager } from './sound';
import { onDeployUnit } from './listeners';

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
