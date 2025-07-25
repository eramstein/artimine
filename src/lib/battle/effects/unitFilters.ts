import type { UnitDeployed } from '@/lib/_model';
import { getAdjacentUnits } from '../unit';
import { bs } from '@/lib/_state';

// use currying to build custom filters
export type UnitFilterBuilder = (...args: any[]) => UnitFilter;
export type UnitFilter = (unit: UnitDeployed) => UnitDeployed[];

export const DataUnitFilters: {
  [key: string]: UnitFilterBuilder;
} = {
  self: () => (unit) => [unit],
  adjacentAllies: () => (unit) =>
    getAdjacentUnits(unit.position).filter((u) => u.ownerPlayerId === unit.ownerPlayerId),
  inRow: () => (unit) => bs.units.filter((u) => u.position.row === unit.position.row),
  inColumn: () => (unit) => bs.units.filter((u) => u.position.column === unit.position.column),
  alliedOfType: (type) => (unit) =>
    bs.units
      .filter((u) => u.ownerPlayerId === unit.ownerPlayerId)
      .filter((u) => u.unitTypes?.includes(type)),
};
