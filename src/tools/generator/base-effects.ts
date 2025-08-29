/*
This file contains all effects that can be used to generate cards, including their name, args and budget.
They refer to functions in DataEffectTemplates.
'range' is a special case of arg, it's of UnitFilterArgs type
*/

import {
  CounterType,
  TargetType,
  type TargetDefinition,
  type UnitKeywords,
  type UnitStatuses,
} from '../../lib/_model';
import { counterCost, getRangeMultiplier, getTargetCount, statusCost } from './budgets';
import { keywordConfig } from './keywords';

export interface BaseEffect {
  effectName: string;
  argNames: string[];
  budget: (args: Record<string, any>, targets: TargetDefinition[]) => number;
  defaultTargets?: TargetDefinition[];
}

export const baseEffects: BaseEffect[] = [
  {
    effectName: 'reanimate',
    argNames: [],
    budget: (args, targets) => 12, // TBD
    defaultTargets: [
      { type: TargetType.GraveyardCard, count: 1 },
      { type: TargetType.EmptyCell, count: 1 },
    ],
  },
  {
    effectName: 'damageEnemyPlayer',
    argNames: ['damage'],
    budget: (args, targets) => (args.damage || 1) * 10, // reach is expensive
  },
  {
    effectName: 'damageUnit',
    argNames: ['damage', 'range', 'fromTriggerParam'],
    budget: (args, targets) => {
      const baseCost = args.damage * 3 || 1;
      const targetMultiplier = getTargetCount(targets);
      const rangeMultiplier = getRangeMultiplier(args.range);
      return baseCost * targetMultiplier * rangeMultiplier;
    },
    defaultTargets: [{ type: TargetType.Units, count: 1 }],
  },
  {
    effectName: 'damageLand',
    argNames: ['damage'],
    budget: (args, targets) => {
      const targetMultiplier = getTargetCount(targets);
      return (args.damage || 1) * targetMultiplier * 7;
    },
  },
  {
    effectName: 'healUnit',
    argNames: ['health', 'range'],
    budget: (args, targets) => {
      const baseCost = args.health * 2 || 1;
      const targetMultiplier = getTargetCount(targets);
      const rangeMultiplier = getRangeMultiplier(args.range);
      return baseCost * targetMultiplier * rangeMultiplier;
    },
    defaultTargets: [{ type: TargetType.Units, count: 1 }],
  },
  {
    effectName: 'addCounters',
    argNames: ['counterType', 'counterValue', 'range'],
    budget: (args, targets) => {
      const baseCost =
        (args.counterValue || 1) * (counterCost[args.counterType as CounterType] || 1);
      const targetMultiplier = getTargetCount(targets);
      const rangeMultiplier = getRangeMultiplier(args.range);
      return baseCost * targetMultiplier * rangeMultiplier;
    },
    defaultTargets: [{ type: TargetType.Units, count: 1 }],
  },
  {
    effectName: 'staticKeyword',
    argNames: ['abilityName', 'keyword', 'keyWordValue', 'range', 'reset'],
    budget: (args, targets) => {
      const baseCost = keywordConfig[args.keyword as keyof UnitKeywords].baseCost; // TBD
      const targetMultiplier = getTargetCount(targets);
      return baseCost * targetMultiplier;
    },
  },
  {
    effectName: 'temporaryEffect',
    argNames: ['effect', 'range'],
    budget: (args, targets) => {
      const baseCost = 12; // TBD
      const targetMultiplier = getTargetCount(targets);
      const rangeMultiplier = getRangeMultiplier(args.range);
      return baseCost * targetMultiplier * rangeMultiplier;
    },
    defaultTargets: [{ type: TargetType.Units, count: 1 }],
  },
  {
    effectName: 'untapPlayer',
    argNames: [],
    budget: (args, targets) => 10,
  },
  {
    effectName: 'incrementColor',
    argNames: ['color'],
    budget: (args, targets) => 8,
  },
  {
    effectName: 'applyUnitStatus',
    argNames: ['statusType', 'duration', 'range', 'fromTriggerParam'],
    budget: (args, targets) => {
      const baseCost = statusCost[args.statusType as keyof UnitStatuses];
      const targetMultiplier = args.fromTriggerParam ? 1 : getTargetCount(targets);
      const rangeMultiplier = getRangeMultiplier(args.range);
      return baseCost * targetMultiplier * rangeMultiplier;
    },
    defaultTargets: [{ type: TargetType.Units, count: 1 }],
  },
  {
    effectName: 'summon',
    argNames: ['summonedUnit', 'isRespawn'],
    budget: (args, targets) => 20, // TBD based on summonedUnit
  },
  {
    effectName: 'darkRitual',
    argNames: ['effect'],
    budget: (args, targets) => (args.effect === 'damage' ? 12 : 6), // TBD
  },
  {
    effectName: 'transferCounters',
    argNames: ['counterType'],
    budget: (args, targets) => 12, // TBD
  },
  {
    effectName: 'drawCard',
    argNames: ['cardCount'],
    budget: (args, targets) => {
      return args.cardCount * 16;
    },
  },
  {
    effectName: 'cycleCards',
    argNames: [],
    budget: (args, targets) => {
      const targetMultiplier = getTargetCount(targets);
      return targetMultiplier * 5;
    },
  },
  {
    effectName: 'destroyUnit',
    argNames: ['range'],
    budget: (args, targets) => {
      const targetMultiplier = getTargetCount(targets);
      return 34 * targetMultiplier;
    },
  },
  {
    effectName: 'bounceUnit',
    argNames: ['range'],
    budget: (args, targets) => {
      const targetMultiplier = getTargetCount(targets);
      return 12 * targetMultiplier;
    },
  },
  {
    effectName: 'fortifyLand',
    argNames: ['amount'],
    budget: (args, targets) => 2, // TBD
  },
  {
    effectName: 'refreshUnit',
    argNames: ['range'],
    budget: (args, targets) => 6, // TBD
  },
  {
    effectName: 'useEnergy',
    argNames: ['effectTemplate', 'energyUsedForArgs', 'energyCost', 'otherArgs'],
    budget: (args, targets) => 0, // TBD
  },
  {
    effectName: 'forceMoveUnit',
    argNames: [],
    budget: (args, targets) => 30, // TBD
  },
];

// Helper function to get a base effect by name
export function getBaseEffect(effectName: string): BaseEffect | undefined {
  return baseEffects.find((effect) => effect.effectName === effectName);
}

// Helper function to get all effect names
export function getEffectNames(): string[] {
  return baseEffects.map((effect) => effect.effectName);
}
