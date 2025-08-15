/*
This file contains all effects that can be used to generate cards, including their name, args and budget.
They refer to functions in DataEffectTemplates.
'range' is a special case of arg, it's of UnitFilterArgs type
*/

import type { TargetDefinition } from '../_model';

export interface BaseEffect {
  effectName: string;
  argNames: string[];
  budget: (args: Record<string, any>, targets: TargetDefinition[]) => number;
}

export const baseEffects: BaseEffect[] = [
  {
    effectName: 'reanimate',
    argNames: [],
    budget: (args, targets) => 8, // High cost for powerful effect
  },
  {
    effectName: 'damageEnemyPlayer',
    argNames: ['damage'],
    budget: (args, targets) => (args.damage || 1) * 2, // 2 points per damage
  },
  {
    effectName: 'damageUnit',
    argNames: ['damage', 'range'],
    budget: (args, targets) => {
      const baseCost = (args.damage || 1) * 1.5; // 1.5 points per damage to units
      const targetMultiplier = targets.length > 0 ? targets.length : 1;
      return baseCost * targetMultiplier;
    },
  },
  {
    effectName: 'addCounters',
    argNames: ['counterType', 'counterValue', 'range'],
    budget: (args, targets) => {
      const baseCost = (args.counterValue || 1) * 1; // 1 point per counter
      const targetMultiplier = targets.length > 0 ? targets.length : 1;
      return baseCost * targetMultiplier;
    },
  },
  {
    effectName: 'staticKeywordAdjAllies',
    argNames: ['name', 'keyword'],
    budget: (args, targets) => {
      const baseCost = 3; // Moderate cost for keyword granting
      const targetMultiplier = targets.length > 0 ? targets.length : 1;
      return baseCost * targetMultiplier;
    },
  },
  {
    effectName: 'untapPlayer',
    argNames: [],
    budget: (args, targets) => 4, // Moderate cost for mana acceleration
  },
  {
    effectName: 'incrementColor',
    argNames: ['color'],
    budget: (args, targets) => 2, // Low cost for color fixing
  },
  {
    effectName: 'applyUnitStatus',
    argNames: ['statusType', 'duration'],
    budget: (args, targets) => {
      const baseCost = 3; // Moderate cost for status effects
      const targetMultiplier = targets.length > 0 ? targets.length : 1;
      return baseCost * targetMultiplier;
    },
  },
  {
    effectName: 'summon',
    argNames: ['summonedUnit', 'isRespawn'],
    budget: (args, targets) => 6, // High cost for summoning
  },
  {
    effectName: 'darkRitual',
    argNames: [],
    budget: (args, targets) => 5, // High cost for mana acceleration
  },
  {
    effectName: 'transferCounters',
    argNames: ['counterType'],
    budget: (args, targets) => {
      const baseCost = 2; // Low cost for counter manipulation
      const targetMultiplier = targets.length > 0 ? targets.length : 1;
      return baseCost * targetMultiplier;
    },
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
