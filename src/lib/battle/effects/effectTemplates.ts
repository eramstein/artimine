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
} from '@/lib/battle';
import { CardColor, CounterType } from '@/lib/_model';
import type {
  EffectArgs,
  Position,
  UnitCard,
  UnitDeployed,
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
  reanimate: () => (p: EffectArgs) => void;
  damageEnemyLeader: (params: { damage: number }) => (p: EffectArgs) => void;
  damageUnit: (params: { damage: number; range?: UnitFilter }) => (p: EffectArgs) => void;
  addCounters: (params: {
    counterType: CounterType;
    counterValue: number;
    range?: UnitFilter;
  }) => (p: EffectArgs) => void;
  staticKeywordAdjAllies: (params: {
    name: string;
    keyword: UnitKeywordDefinition;
  }) => (p: EffectArgs) => void;
  untapPlayer: () => (p: EffectArgs) => void;
  incrementColor: (color: CardColor) => (p: EffectArgs) => void;
};

export const DataEffectTemplates: EffectTemplateFunctions = {
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
  damageUnit: ({ damage, range }) => {
    return ({ targets }) => {
      (targets[0] as UnitDeployed[]).forEach((target) => {
        const unitsInRange = range?.fn(target) ?? [target];
        unitsInRange.forEach((u) => {
          damageUnit(u, damage);
        });
      });
    };
  },
  addCounters: ({ counterType, counterValue, range = DataUnitFilters.self() }) => {
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
};
