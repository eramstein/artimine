import { bs } from '../_state';
import type { Card, Position, UnitCard } from '../_model';
import { deployUnit } from './unit';

export function getAllGraveyardsCards(): Card[] {
  return bs.players.flatMap((p) => p.graveyard);
}

export function reanimate(card: UnitCard, position: Position) {
  const player = bs.players[card.ownerPlayerId];
  if (player) {
    player.graveyard.splice(player.graveyard.indexOf(card), 1);
    deployUnit(card, position);
  }
}
