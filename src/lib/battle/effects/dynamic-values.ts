import { CardType, UnitType, type Player, type UnitDeployed } from '@/lib/_model';
import { bs } from '@/lib/_state';

export enum DynamicValue {
  UnitsInGraveyard = 'units in graveyards',
  Ennemies = 'ennemies',
  Buildings = 'buildings',
  UnitsWithStatus = 'units with status',
  EnergyCounters = 'energy counters',
}

export const DynamicValues: Record<
  DynamicValue,
  ({ unit, player }: { unit?: UnitDeployed; player?: Player }) => number
> = {
  [DynamicValue.UnitsInGraveyard]: () => {
    return bs.players.reduce(
      (acc, player) => acc + player.graveyard.filter((c) => c.type === CardType.Unit).length,
      0
    );
  },
  [DynamicValue.Ennemies]: ({ unit, player }: { unit?: UnitDeployed; player?: Player }) => {
    const playerId = player ? player.id : unit?.ownerPlayerId;
    return bs.units.filter((u) => u.ownerPlayerId !== playerId).length;
  },
  [DynamicValue.Buildings]: () => {
    return bs.units.filter((u) => u.unitTypes?.includes(UnitType.Building)).length;
  },
  [DynamicValue.UnitsWithStatus]: () => {
    return bs.units.filter((u) => Object.keys(u.statuses).length > 0).length;
  },
  [DynamicValue.EnergyCounters]: ({ unit, player }: { unit?: UnitDeployed; player?: Player }) => {
    const playerId = player ? player.id : unit?.ownerPlayerId;
    return bs.units
      .filter((u) => u.ownerPlayerId === playerId)
      .reduce((acc, u) => acc + (u.counters.energy || 0), 0);
  },
};
