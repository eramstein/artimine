import {
  addStaticKeyword,
  applyTemporaryEffect,
  damagePlayer,
  damageUnit,
  getAdjacentAllies,
  getOpposingPlayer,
  removeStaticKeyword,
} from '@/lib/battle';
import type { EffectArgs, UnitDeployed } from '@/lib/_model/model-battle';
import { bs } from '@/lib/_state';

// return the effect function, it gets these args { unit, targets, triggerParams }

export const DataEffectTemplates: {
  [key: string]: ({ ...any }) => (p: EffectArgs) => void;
} = {
  buffAdjAlliesTemp: ({ ...effect }) => {
    return ({ triggerParams }) => {
      getAdjacentAllies(triggerParams.mover).forEach((u) => {
        applyTemporaryEffect(u, { ...effect });
      });
    };
  },
  grow: ({ growthValue }) => {
    return ({ unit }) => {
      unit.power += growthValue;
      unit.health += growthValue;
      unit.maxHealth += growthValue;
    };
  },
  damageEnemyLeader: ({ damage }) => {
    return ({ unit }) => {
      damagePlayer(getOpposingPlayer(unit), damage);
    };
  },
  damageUnit: ({ damage }) => {
    return ({ targets }) => {
      (targets as UnitDeployed[]).forEach((target) => {
        damageUnit(target, damage);
      });
    };
  },
  staticKeywordAdjAllies: ({ name, keyword }) => {
    return ({ unit }) => {
      const targetIds = getAdjacentAllies(unit).map((u) => u.instanceId);
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
