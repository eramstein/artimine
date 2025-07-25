import type { UnitDeployed } from '@/lib/_model';
import { UnitType } from '@/lib/_model/enums';
import { getAdjacentUnits } from '../unit';
import { bs } from '@/lib/_state';

export type UnitFilter = {
  fn: (unit: UnitDeployed) => UnitDeployed[];
  name: string;
};

// use currying to build custom filters
// Define specific function signatures for each unit filter
type UnitFilterFunctions = {
  self: () => UnitFilter;
  adjacentAllies: () => UnitFilter;
  inRow: () => UnitFilter;
  inColumn: () => UnitFilter;
  alliesInRow: () => UnitFilter;
  ennemiesInRow: () => UnitFilter;
  alliedOfType: (type: UnitType) => UnitFilter;
};

export const DataUnitFilters: UnitFilterFunctions = {
  self: () => ({ fn: (unit) => [unit], name: 'self' }),
  adjacentAllies: () => ({
    fn: (unit) =>
      getAdjacentUnits(unit.position).filter((u) => u.ownerPlayerId === unit.ownerPlayerId),
    name: 'adjacent allies',
  }),
  inRow: () => ({
    fn: (unit) => bs.units.filter((u) => u.position.row === unit.position.row),
    name: 'units in row',
  }),
  inColumn: () => ({
    fn: (unit) => bs.units.filter((u) => u.position.column === unit.position.column),
    name: 'units in column',
  }),
  alliesInRow: () => ({
    fn: (unit) =>
      bs.units.filter(
        (u) => u.ownerPlayerId === unit.ownerPlayerId && u.position.row === unit.position.row
      ),
    name: 'allies in row',
  }),
  ennemiesInRow: () => ({
    fn: (unit) =>
      bs.units.filter(
        (u) => u.ownerPlayerId !== unit.ownerPlayerId && u.position.row === unit.position.row
      ),
    name: 'ennemies in row',
  }),
  alliedOfType: (type: UnitType) => ({
    fn: (unit) =>
      bs.units
        .filter((u) => u.ownerPlayerId === unit.ownerPlayerId)
        .filter((u) => u.unitTypes?.includes(type)),
    name: 'allied ' + type + ' units',
  }),
};
