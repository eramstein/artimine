import {
  addStaticKeyword,
  applyTemporaryEffect,
  damagePlayer,
  damageUnit,
  getOpposingPlayer,
  removeStaticKeyword,
  addCounters,
} from '@/lib/battle';
import { CounterType, UnitType } from '@/lib/_model';
import type { EffectArgs, UnitDeployed } from '@/lib/_model/model-battle';
import { bs } from '@/lib/_state';
import { DataUnitFilters, type UnitFilter } from './unitFilters';

// return the effect function, it gets these args { unit, targets, triggerParams }

export const DataEffectTemplates: {
  [key: string]: ({ ...any }) => (p: EffectArgs) => void;
} = {
  buffAdjAlliesTemp: ({ ...effect }) => {
    return ({ triggerParams }) => {
      DataUnitFilters.adjacentAllies()(triggerParams.mover).forEach((u) => {
        applyTemporaryEffect(u, { ...effect });
      });
    };
  },
  grow: ({ growthValue }) => {
    return ({ unit }) => {
      addCounters(unit, CounterType.Growth, growthValue);
    };
  },
  decay: ({ decayValue }) => {
    return ({ unit }) => {
      addCounters(unit, CounterType.Decay, decayValue);
    };
  },
  damageEnemyLeader: ({ damage }) => {
    return ({ unit }) => {
      damagePlayer(getOpposingPlayer(unit), damage);
    };
  },
  damageUnit: ({ damage }) => {
    return ({ targets }) => {
      (targets[0] as UnitDeployed[]).forEach((target) => {
        damageUnit(target, damage);
      });
    };
  },
  addCounters: ({ counterType, counterValue, targets }) => {
    return ({ unit }) => {
      const targetIds = (targets as UnitFilter)(unit).map((u) => u.instanceId);
      bs.units.forEach((u) => {
        if (targetIds.includes(u.instanceId)) {
          addCounters(u, counterType, counterValue);
        }
      });
    };
  },
  staticKeywordAdjAllies: ({ name, keyword }) => {
    return ({ unit }) => {
      const targetIds = DataUnitFilters.adjacentAllies()(unit).map((u) => u.instanceId);
      bs.units.forEach((u) => {
        if (targetIds.includes(u.instanceId)) {
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
};
