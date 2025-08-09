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
} from '@/lib/battle';
import { CardColor, CounterType } from '@/lib/_model';
import type {
  EffectArgs,
  Position,
  UnitCard,
  UnitDeployed,
  UnitKeywordDefinition,
  UnitEndOfTurnEffects,
  UnitCardTemplate,
} from '@/lib/_model/model-battle';
import { bs } from '@/lib/_state';
import { reanimate } from '../graveyard';
import { filterUnits, type UnitFilterArgs } from './unitFilters';

export const DataEffectTemplates: Record<string, (args: any) => (p: EffectArgs) => void> = {
  reanimate:
    () =>
    ({ unit, player, targets }) => {
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
  damageEnemyLeader:
    ({ damage }) =>
    ({ unit }) => {
      damagePlayer(getOpposingPlayer(unit), damage);
    },
  damageUnit:
    ({ damage, range }: { damage: number; range?: UnitFilterArgs }) =>
    ({ targets }) => {
      (targets[0] as UnitDeployed[]).forEach((target) => {
        const unitsInRange = range ? filterUnits({ unit: target, ...range }) : [target];
        unitsInRange.forEach((u) => {
          damageUnit(u, damage);
        });
      });
    },
  addCounters:
    ({
      counterType = CounterType.Growth,
      counterValue = 1,
      range,
    }: {
      counterType: CounterType;
      counterValue: number;
      range?: UnitFilterArgs;
    }) =>
    ({ unit, targets }) => {
      const targetUnits = targets[0]?.length ? (targets[0] as UnitDeployed[]) : [unit];
      targetUnits.forEach((u) => {
        const unitsInRange = range ? filterUnits({ unit: u, ...range }) : [u];
        unitsInRange.forEach((u) => {
          addCounters(u, counterType, counterValue);
        });
      });
    },
  staticKeywordAdjAllies:
    ({ name, keyword }) =>
    ({ unit }) => {
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
  untapPlayer:
    () =>
    ({ player }) => {
      untapPlayer(player);
    },
  incrementColor:
    (color) =>
    ({ player }) => {
      incrementColor(player, color, 1);
    },
  applyUnitStatus:
    ({ statusType, duration }) =>
    ({ targets }) => {
      (targets[0] as UnitDeployed[]).forEach((u) => {
        applyUnitStatus(u, statusType, duration);
      });
    },
  summon:
    ({ summonedUnit, isRespawn }: { summonedUnit: UnitCardTemplate; isRespawn?: boolean }) =>
    ({ targets, player, unit }) => {
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
  darkRitual:
    () =>
    ({ targets }) => {
      const sacrificedUnit = targets[0][0] as UnitDeployed;
      const targetUnit = targets[1][0] as UnitDeployed;
      const sacrificedHealth = sacrificedUnit.health;
      damageUnit(targetUnit, sacrificedHealth);
      destroyUnit(sacrificedUnit);
    },
  transferCounters:
    ({ counterType = CounterType.Growth }: { counterType: CounterType }) =>
    ({ targets }) => {
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
};
