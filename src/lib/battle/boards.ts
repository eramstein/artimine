import { config } from '../_config';
import type { Position } from '../_model';
import { bs } from '../_state';

export function isCellFree(position: Position) {
  return !bs.units.some((unit) => unit.position === position);
}

export function isOnPlayersSide(position: Position, playerId: number) {
  if (playerId === 0) {
    return position.column < config.boardColumns / 2;
  }
  return position.column >= config.boardColumns / 2;
}
