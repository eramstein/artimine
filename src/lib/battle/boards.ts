import { config } from '../_config';
import type { Player, Position } from '../_model';
import { bs } from '../_state';

// unique string identifier for a position
export function getPositionKey(position: Position) {
  return `${position.row}-${position.column}`;
}

export function isCellFree(position: Position) {
  if (!position) return false;
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

export function isBoardSizeFull(leader: Player): boolean {
  return (
    bs.units.filter((u) => u.ownerPlayerId === leader.id).length ===
    (config.boardColumns * config.boardRows) / 2
  );
}

export function getPossibleDeploymentPositions(isPlayer: boolean): Position[] {
  const positionMap: Record<string, boolean> = {};
  const startColumn = isPlayer ? 1 : config.boardColumns / 2;
  const colCount = Math.floor(config.boardColumns / 2);
  // fill with all positions on leader's side of the board
  for (let row = 0; row < config.boardRows; row++) {
    for (let column = startColumn; column < startColumn + colCount; column++) {
      positionMap[row + '-' + column] = true;
    }
  }
  // remove occupied positions
  for (const unit of bs.units) {
    positionMap[unit.position.row + '-' + unit.position.column] = false;
  }
  return (<any>Object)
    .entries(positionMap)
    .filter(([_, val]: [string, boolean]) => val)
    .map(([key, _]: [string, boolean]) => ({
      row: +key.split('-')[0],
      column: +key.split('-')[1],
    }));
}
