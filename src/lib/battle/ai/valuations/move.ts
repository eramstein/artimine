import type { Position, UnitDeployed } from '@/lib/_model';
import { getEmptyCells } from '../../boards';
import { getDangerLevelPerRow, getOpponentCountPerRow, getOpponentPowerPerRow } from '../rows';
import { landDestructionValue } from './config';
import { valueUnit } from './unit';

export function getHighestMoveValue(unit: UnitDeployed): {
  value: number;
  cell: Position;
} {
  const ennemyPowerPerRow = getOpponentPowerPerRow();
  const dangerLevelPerRow = getDangerLevelPerRow();
  const ennemyCountPerRow = getOpponentCountPerRow();
  const cells = getEmptyCells(false);
  const moveValues = cells.map((cell) =>
    getMoveValue(unit, cell, dangerLevelPerRow, ennemyPowerPerRow, ennemyCountPerRow)
  );
  return {
    value: Math.max(...moveValues),
    cell: cells[moveValues.indexOf(Math.max(...moveValues))],
  };
}

const getMoveValue = (
  unit: UnitDeployed,
  cell: Position,
  dangerLevelPerRow: Record<number, number>,
  ennemyPowerPerRow: Record<number, number>,
  ennemyCountPerRow: Record<number, number>
): number => {
  const dangerLevel = dangerLevelPerRow[cell.row];
  const ennemyPower = ennemyPowerPerRow[cell.row];
  const ennemyCount = ennemyCountPerRow[cell.row];
  const wouldBeDestroyed = unit.health + (unit.keywords?.armor || 0) * ennemyCount <= ennemyPower;

  // If in danger of losing, blocking is mandatory
  if (dangerLevel === Infinity) {
    return Infinity;
  }

  // If in danger of losing a land, block unless unit gets destroyed
  if (dangerLevel === landDestructionValue && !wouldBeDestroyed) {
    return landDestructionValue;
  }

  // If would be destroyed
  if (wouldBeDestroyed) {
    return -valueUnit(unit);
  }

  // Else, neutral value
  // TODO: add value if protecting vulnerable valuable unit
  // TODO: add value for retaliation
  return 0;
};
