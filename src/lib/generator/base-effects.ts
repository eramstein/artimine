/*
This file contains all effects that can be used to generate cards, including their name, args and budget.
They refer to functions in DataEffectTemplates.
'range' is a special case of arg, it's of UnitFilterArgs type
*/

export interface BaseEffect {
  effectName: string;
  argNames: string[];
  budget: (args: Record<string, any>) => number;
}

export const baseEffects: BaseEffect[] = [
  {
    effectName: 'reanimate',
    argNames: [],
    budget: (args) => 0, // TODO: implement budget calculation
  },
  {
    effectName: 'damageEnemyPlayer',
    argNames: ['damage'],
    budget: (args) => 0, // TODO: implement budget calculation
  },
  {
    effectName: 'damageUnit',
    argNames: ['damage', 'range'],
    budget: (args) => 0, // TODO: implement budget calculation
  },
  {
    effectName: 'addCounters',
    argNames: ['counterType', 'counterValue', 'range'],
    budget: (args) => 0, // TODO: implement budget calculation
  },
  {
    effectName: 'staticKeywordAdjAllies',
    argNames: ['name', 'keyword'],
    budget: (args) => 0, // TODO: implement budget calculation
  },
  {
    effectName: 'untapPlayer',
    argNames: [],
    budget: (args) => 0, // TODO: implement budget calculation
  },
  {
    effectName: 'incrementColor',
    argNames: ['color'],
    budget: (args) => 0, // TODO: implement budget calculation
  },
  {
    effectName: 'applyUnitStatus',
    argNames: ['statusType', 'duration'],
    budget: (args) => 0, // TODO: implement budget calculation
  },
  {
    effectName: 'summon',
    argNames: ['summonedUnit', 'isRespawn'],
    budget: (args) => 0, // TODO: implement budget calculation
  },
  {
    effectName: 'darkRitual',
    argNames: [],
    budget: (args) => 0, // TODO: implement budget calculation
  },
  {
    effectName: 'transferCounters',
    argNames: ['counterType'],
    budget: (args) => 0, // TODO: implement budget calculation
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
