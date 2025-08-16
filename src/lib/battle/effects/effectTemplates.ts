import {
  addStaticKeyword,
  applyTemporaryEffect,
  damagePlayer,
  damageUnit,
  getOpposingPlayer,
  removeStaticKeyword,
  addCounters,
  untapPlayer,
  incrementColor,
  applyUnitStatus,
  summonUnit,
  makeUnit,
  destroyUnit,
  removeCounters,
  healUnit,
  drawCard,
} from '@/lib/battle';
import { CardColor, CounterType, StatusType } from '@/lib/_model';
import type {
  EffectArgs,
  Position,
  UnitCard,
  UnitDeployed,
  UnitKeywordDefinition,
  UnitEndOfTurnEffects,
  UnitCardTemplate,
  TargetDefinition,
} from '@/lib/_model/model-battle';
import { bs } from '@/lib/_state';
import { reanimate } from '../graveyard';
import { filterUnits, getRangeLabel, getUnitsInRange, type UnitFilterArgs } from './unitFilters';
import { getTargetLabel } from '../target';

export const DataEffectTemplates: Record<
  string,
  (args: any) => { fn: (p: EffectArgs) => void; label: (targets: TargetDefinition[]) => string }
> = {
  reanimate: () => ({
    fn: ({ unit, player, targets }) => {
      if (targets.length < 2) {
        return;
      }
      const playerId = player?.id ?? unit?.ownerPlayerId;
      const reanimatedUnit = targets[0]?.[0] as UnitCard;
      const position = targets[1]?.[0] as Position;
      if (reanimatedUnit && position) {
        reanimate(reanimatedUnit, position, playerId);
      }
    },
    label: () => `Reanimate a unit to a position`,
  }),
  damageEnemyPlayer: ({ damage }) => ({
    fn: ({ unit }) => {
      damagePlayer(getOpposingPlayer(unit), damage);
    },
    label: () => `Deal ${damage} damage to the enemy player`,
  }),
  damageUnit: ({ damage, range }: { damage: number; range?: UnitFilterArgs }) => ({
    fn: ({ targets, unit, player }) => {
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        damageUnit(u, damage);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
      return `Deal ${damage} damage to ${targetsLabel}. ${range ? getRangeLabel(range) : ''}`;
    },
  }),
  healUnit: ({ health, range }: { health: number; range?: UnitFilterArgs }) => ({
    fn: ({ targets, unit, player }) => {
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        healUnit(u, health);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
      return `Heal ${health} to ${targetsLabel}. ${range ? getRangeLabel(range) : ''}`;
    },
  }),
  addCounters: ({
    counterType = CounterType.Growth,
    counterValue = 1,
    range,
  }: {
    counterType: CounterType;
    counterValue: number;
    range?: UnitFilterArgs;
  }) => ({
    fn: ({ unit, targets, player }) => {
      console.log('addCounters', { unit, targets, player });
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        addCounters(u, counterType, counterValue);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
      return `Add ${counterValue} ${counterType} counter${counterValue !== 1 ? 's' : ''}${targetsLabel}. ${range ? getRangeLabel(range) : ''}`;
    },
  }),
  staticKeywordAdjAllies: ({ name, keyword }) => ({
    fn: ({ unit }) => {
      const unitsInRange = filterUnits({ unit, adjacent: true, allies: true });
      unitsInRange.forEach((u) => {
        addStaticKeyword(u, unit, keyword, false, name);
      });
      bs.units.forEach((u) => {
        if (
          u.staticModifiers.filter(
            (sm) => sm.source.unitId === unit.instanceId && sm.source.abilityName === name
          ).length > 0
        ) {
          removeStaticKeyword(u, unit, name);
        }
      });
    },
    label: () => `Give ${keyword} to adjacent allies (${name})`,
  }),
  untapPlayer: () => ({
    fn: ({ player }) => {
      untapPlayer(player);
    },
    label: () => `Untap this player`,
  }),
  incrementColor: (color) => ({
    fn: ({ player }) => {
      incrementColor(player, color, 1);
    },
    label: () => `Add 1 ${color} mana`,
  }),
  applyUnitStatus: ({
    statusType,
    duration,
    range,
  }: {
    statusType: StatusType;
    duration: number;
    range?: UnitFilterArgs;
  }) => ({
    fn: ({ targets, player, unit }) => {
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        applyUnitStatus(u, statusType, duration);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
      return `Apply ${statusType} for ${duration} turn${duration !== 1 ? 's' : ''}${targetsLabel}`;
    },
  }),
  summon: ({
    summonedUnit,
    isRespawn,
  }: {
    summonedUnit: UnitCardTemplate;
    isRespawn?: boolean;
  }) => ({
    fn: ({ targets, player, unit }) => {
      if (isRespawn) {
        const createdUnit = makeUnit(player.id, summonedUnit);
        summonUnit(createdUnit, unit.position);
      } else {
        (targets[0] as Position[]).forEach((cell: Position) => {
          const createdUnit = makeUnit(player.id, summonedUnit);
          summonUnit(createdUnit, cell);
        });
      }
    },
    label: () =>
      isRespawn
        ? `Respawn ${summonedUnit.name} at this unit's position`
        : `Summon ${summonedUnit.name} to target position`,
  }),
  darkRitual: () => ({
    fn: ({ targets }) => {
      const sacrificedUnit = targets[0][0] as UnitDeployed;
      const targetUnit = targets[1][0] as UnitDeployed;
      const sacrificedHealth = sacrificedUnit.health;
      damageUnit(targetUnit, sacrificedHealth);
      destroyUnit(sacrificedUnit);
    },
    label: () => 'Sacrifice a unit to deal damage equal to its health to another unit',
  }),
  transferCounters: ({ counterType = CounterType.Growth }: { counterType: CounterType }) => ({
    fn: ({ targets }) => {
      const unit = targets[0][0] as UnitDeployed;
      let movedCounters = 0;
      bs.units.forEach((u) => {
        if (u.instanceId === unit.instanceId) {
          return;
        }
        const counters = u.counters[counterType] || 0;
        removeCounters(u, counterType, counters);
        movedCounters += counters;
      });
      if (movedCounters > 0) {
        addCounters(unit, counterType, movedCounters);
      }
    },
    label: () => `Transfer all ${counterType} counters from other units to this unit`,
  }),
  drawCard: ({ cardCount = 1 }) => ({
    fn: ({ player }) => {
      for (let i = 0; i < cardCount; i++) {
        drawCard(player);
      }
    },
    label: () => `Draw ${cardCount} card${cardCount !== 1 ? 's' : ''}`,
  }),
};
