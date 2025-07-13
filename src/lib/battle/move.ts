import { config } from '../_config';
import type { Position, UnitCardDeployed } from '../_model/model-battle';
import { getPositionKey, isCellFree, isOnPlayersSide } from './boards';

export function canMove(unit: UnitCardDeployed) {
  return !unit.exhausted;
}

export function validMoveTargets(unit: UnitCardDeployed): Record<string, boolean> {
  const targets: Record<string, boolean> = {};

  // Check if unit is on player's side
  const isOnPlayerSide = isOnPlayersSide(unit.position, unit.ownerPlayerId);

  // Determine which columns to check based on unit's side
  const startCol = isOnPlayerSide ? 0 : config.boardColumns / 2;
  const endCol = isOnPlayerSide ? config.boardColumns / 2 : config.boardColumns;

  // Iterate through only the relevant columns
  for (let row = 0; row < config.boardRows; row++) {
    for (let col = startCol; col < endCol; col++) {
      const position = { row, column: col };

      // Check if the cell is free
      if (isCellFree(position)) {
        targets[getPositionKey(position)] = true;
      }
    }
  }

  return targets;
}

export function moveUnit(unit: UnitCardDeployed, targetPosition: Position) {
  // check if possible
  if (!canMove(unit)) return;
  if (!validMoveTargets(unit)[getPositionKey(targetPosition)]) return;

  // move unit
  unit.position = targetPosition;
  console.log('moved unit to', targetPosition);
  unit.exhausted = true;
  unit.hasMoved = true;
}
