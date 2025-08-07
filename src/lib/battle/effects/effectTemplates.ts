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
import { DataUnitFilters, type UnitFilter } from './unitFilters';
import { reanimate } from '../graveyard';

export const DataEffectTemplates: Record<string, (args: any) => (p: EffectArgs) => void> = {
  buffAdjAlliesTemp: ({ ...effect }) => {
    return ({ triggerParams }) => {
      DataUnitFilters.adjacentAllies()
        .fn(triggerParams.mover)
        .forEach((u) => {
          applyTemporaryEffect(u, { ...effect });
        });
    };
  },
  reanimate: () => {
    return ({ unit, player, targets }) => {
      if (targets.length < 2) {
        return;
      }
      const playerId = player?.id ?? unit?.ownerPlayerId;
      const reanimatedUnit = targets[0]?.[0] as UnitCard;
      const position = targets[1]?.[0] as Position;
      if (reanimatedUnit && position) {
        reanimate(reanimatedUnit, position, playerId);
      }
    };
  },
  damageEnemyLeader: ({ damage }) => {
    return ({ unit }) => {
      damagePlayer(getOpposingPlayer(unit), damage);
    };
  },
  damageUnit: ({ damage, range }: { damage: number; range?: UnitFilter }) => {
    return ({ targets }) => {
      (targets[0] as UnitDeployed[]).forEach((target) => {
        const unitsInRange = range?.fn(target) ?? [target];
        unitsInRange.forEach((u) => {
          damageUnit(u, damage);
        });
      });
    };
  },
  addCounters: ({
    counterType,
    counterValue,
    range = DataUnitFilters.self(),
  }: {
    counterType: CounterType;
    counterValue: number;
    range?: UnitFilter;
  }) => {
    return ({ unit, targets }) => {
      const targetUnits = targets[0]?.length ? (targets[0] as UnitDeployed[]) : [unit];
      targetUnits.forEach((u) => {
        const unitsInRange = range.fn(u).map((u) => u.instanceId);
        bs.units.forEach((u) => {
          if (unitsInRange.includes(u.instanceId)) {
            addCounters(u, counterType, counterValue);
          }
        });
      });
    };
  },
  staticKeywordAdjAllies: ({ name, keyword }) => {
    return ({ unit }) => {
      const unitsInRange = DataUnitFilters.adjacentAllies()
        .fn(unit)
        .map((u) => u.instanceId);
      bs.units.forEach((u) => {
        if (unitsInRange.includes(u.instanceId)) {
          addStaticKeyword(u, unit, keyword, false, name);
        } else if (
          u.staticModifiers.filter(
            (sm) => sm.source.unitId === unit.instanceId && sm.source.abilityName === name
          ).length > 0
        ) {
          removeStaticKeyword(u, unit, name);
        }
      });
    };
  },
  untapPlayer: () => {
    return ({ player }) => {
      untapPlayer(player);
    };
  },
  incrementColor: (color) => {
    return ({ player }) => {
      incrementColor(player, color, 1);
    };
  },
  applyUnitStatus: ({ statusType, duration }) => {
    return ({ targets }) => {
      (targets[0] as UnitDeployed[]).forEach((u) => {
        applyUnitStatus(u, statusType, duration);
      });
    };
  },
  summon: ({
    summonedUnit,
    isRespawn,
  }: {
    summonedUnit: UnitCardTemplate;
    isRespawn?: boolean;
  }) => {
    return ({ targets, player, unit }) => {
      if (isRespawn) {
        const createdUnit = makeUnit(player.id, summonedUnit);
        summonUnit(createdUnit, unit.position);
      } else {
        (targets[0] as Position[]).forEach((cell: Position) => {
          const createdUnit = makeUnit(player.id, summonedUnit);
          summonUnit(createdUnit, cell);
        });
      }
    };
  },
};
