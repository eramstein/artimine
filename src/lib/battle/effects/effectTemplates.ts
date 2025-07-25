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
import type {
  Card,
  EffectArgs,
  Position,
  UnitCard,
  UnitDeployed,
  UnitKeywords,
  UnitKeywordDefinition,
  UnitEndOfTurnEffects,
} from '@/lib/_model/model-battle';
import { bs } from '@/lib/_state';
import { DataUnitFilters, type UnitFilter } from './unitFilters';
import { reanimate } from '../graveyard';

// return the effect function, it gets these args { unit, targets, triggerParams }

// Define specific function signatures for each effect template
type EffectTemplateFunctions = {
  buffAdjAlliesTemp: (effect: Partial<UnitEndOfTurnEffects>) => (p: EffectArgs) => void;
  grow: (params: { growthValue: number }) => (p: EffectArgs) => void;
  decay: (params: { decayValue: number }) => (p: EffectArgs) => void;
  reanimate: () => (p: EffectArgs) => void;
  damageEnemyLeader: (params: { damage: number }) => (p: EffectArgs) => void;
  damageUnit: (params: { damage: number }) => (p: EffectArgs) => void;
  addCounters: (params: {
    counterType: CounterType;
    counterValue: number;
    range: UnitFilter;
  }) => (p: EffectArgs) => void;
  staticKeywordAdjAllies: (params: {
    name: string;
    keyword: UnitKeywordDefinition;
  }) => (p: EffectArgs) => void;
};

export const DataEffectTemplates: EffectTemplateFunctions = {
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
  damageUnit: ({ damage }) => {
    return ({ targets }) => {
      (targets[0] as UnitDeployed[]).forEach((target) => {
        damageUnit(target, damage);
      });
    };
  },
  addCounters: ({ counterType, counterValue, range }) => {
    return ({ unit, targets }) => {
      const targetUnits = targets[0]?.length ? (targets[0] as UnitDeployed[]) : [unit];
      targetUnits.forEach((u) => {
        const unitsInRange = (range as UnitFilter)(u).map((u) => u.instanceId);
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
      const unitsInRange = DataUnitFilters.adjacentAllies()(unit).map((u) => u.instanceId);
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
};
