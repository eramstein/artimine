import type { Position, UnitDeployed } from '@/lib/_model';
import { getRandomFromArray } from '@/lib/_utils/random';
import { getEmptyCells } from '../../boards';
import { getDangerLevelPerRow, getOpponentCountPerRow, getOpponentUnitDamagePerRow } from '../rows';
import { landDestructionValue } from './config';
import { valueUnit } from './unit';

export function getHighestMoveValue(unit: UnitDeployed): {
  value: number;
  cell: Position;
} | null {
  const ennemyPowerPerRow = getOpponentUnitDamagePerRow();
  const dangerLevelPerRow = getDangerLevelPerRow(unit);
  const ennemyCountPerRow = getOpponentCountPerRow();
  const cells = getEmptyCells(false);
  const moveValues = cells.map((cell) =>
    getMoveValue(unit, cell, dangerLevelPerRow, ennemyPowerPerRow, ennemyCountPerRow)
  );
  const maxValue = Math.max(...moveValues);
  const cellsToConsider = moveValues
    .map((c, i) => ({ index: i, value: c }))
    .filter((c) => c.value === maxValue);
  if (cellsToConsider.length === 0) {
    return null;
  }
  console.log(unit, dangerLevelPerRow, moveValues, maxValue, cellsToConsider);
  return {
    value: maxValue,
    cell: cells[getRandomFromArray(cellsToConsider).index],
  };
}

export function getHighestMoveValueInRow(
  unit: UnitDeployed,
  preferredRow: number
): { value: number; cell: Position } | null {
  const cells = getEmptyCells(false);
  const rowCells = cells.filter((c) => c.row === preferredRow);
  if (rowCells.length === 0) {
    return getHighestMoveValue(unit);
  }

  const ennemyPowerPerRow = getOpponentUnitDamagePerRow();
  const dangerLevelPerRow = getDangerLevelPerRow();
  const ennemyCountPerRow = getOpponentCountPerRow();
  const moveValues = rowCells.map((cell) =>
    getMoveValue(unit, cell, dangerLevelPerRow, ennemyPowerPerRow, ennemyCountPerRow)
  );
  const maxValue = Math.max(...moveValues);
  if (maxValue > -Infinity) {
    const best = rowCells[moveValues.indexOf(maxValue)];
    return { value: maxValue, cell: best };
  }

  return getHighestMoveValue(unit);
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
  const wouldBeDestroyed =
    (unit.health ?? unit.maxHealth) + (unit.keywords?.armor || 0) * ennemyCount <= ennemyPower;

  // If the unit stands in front of lethal, don't move
  if (unit.position && dangerLevelPerRow[unit.position.row] === Infinity) {
    return -Infinity;
  }

  // If another row is lethal, blocking is mandatory
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
  return 0;
};
