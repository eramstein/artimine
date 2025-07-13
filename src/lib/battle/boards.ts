import { config } from '../_config';
import type { Position } from '../_model';
import { bs } from '../_state';

// unique string identifier for a position
export function getPositionKey(position: Position) {
  return `${position.row}-${position.column}`;
}

export function isCellFree(position: Position) {
  return !bs.units.some(
    (unit) => unit.position.row === position.row && unit.position.column === position.column
  );
}

export function isOnPlayersSide(position: Position, playerId: number) {
  if (playerId === 0) {
    return position.column < config.boardColumns / 2;
  }
  return position.column >= config.boardColumns / 2;
}
