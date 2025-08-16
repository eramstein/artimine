/* 
  This is managing how many "points" a card gets based on its cost.
  Points can then be used to get power, health, keywords and abilities.
*/

import { config } from '../../lib/_config';
import { CardColor, CounterType } from '../../lib/_model';
import type { UnitStatuses } from '../../lib/_model/model-battle';
import { getBaseEffect } from './base-effects';
import type { ActionDefinition, TargetDefinition } from '../../lib/_model/model-battle';
import type { UnitFilterArgs } from '../../lib/battle/effects/unitFilters';

export const budgetPerCost: Record<number, number> = {
  1: 5,
  2: 10,
  3: 15,
  4: 21,
  5: 27,
  6: 34,
  7: 42,
  8: 51,
  9: 61,
  10: 72,
};

export const extraBudget: Record<string, Record<string, number>> = {
  // if a card has a equal or higher color than mana, get more budget to compensate tempo loss
  morecolorThanMana: {
    equal: 2,
    oneMore: 5,
    twoMore: 9,
  },
  // large commitment in one color gets more budget
  inOneColor: {
    two: 1,
    three: 2,
    four: 3,
  },
  // multi-colored cards get more budget
  multiColor: {
    two: 1,
    three: 2,
    four: 3,
  },
};

export const baseStatsCost = {
  power: 3,
  health: 2,
};

export function getBudgetForUnit(
  manaCost: number,
  colors: { color: CardColor; count: number }[]
): number {
  let budget = budgetPerCost[manaCost];

  const colorCount = colors.reduce((acc, color) => acc + color.count, 0);
  const minTurnAvailable = Math.max(config.initialMana, manaCost);

  // if a card has a equal or higher color than mana, get more budget to compensate tempo loss
  if (colorCount === minTurnAvailable) {
    budget += extraBudget.morecolorThanMana.equal;
  } else if (colorCount === minTurnAvailable + 1) {
    budget += extraBudget.morecolorThanMana.oneMore;
  } else if (colorCount >= minTurnAvailable + 2) {
    budget += extraBudget.morecolorThanMana.twoMore;
  }

  // large commitment in one color gets more budget
  const colorCounts = colors.map((color) => color.count);
  const maxColorCount = Math.max(...colorCounts);
  if (maxColorCount === 2) {
    budget += extraBudget.inOneColor.two;
  } else if (maxColorCount === 3) {
    budget += extraBudget.inOneColor.three;
  } else if (maxColorCount >= 4) {
    budget += extraBudget.inOneColor.four;
  }

  // multi-colored cards get more budget
  if (colors.length === 2) {
    budget += extraBudget.multiColor.two;
  }
  if (colors.length === 3) {
    budget += extraBudget.multiColor.three;
  }
  if (colors.length >= 4) {
    budget += extraBudget.multiColor.four;
  }

  return budget;
}

export function getBudgetForSpell(
  manaCost: number,
  colors: { color: CardColor; count: number }[]
): number {
  let budget = budgetPerCost[manaCost];

  const colorCount = colors.reduce((acc, color) => acc + color.count, 0);
  const minTurnAvailable = Math.max(config.initialMana, manaCost);

  // if a card has a equal or higher color than mana, get more budget to compensate tempo loss
  if (colorCount === minTurnAvailable) {
    budget += extraBudget.morecolorThanMana.equal;
  } else if (colorCount === minTurnAvailable + 1) {
    budget += extraBudget.morecolorThanMana.oneMore;
  } else if (colorCount >= minTurnAvailable + 2) {
    budget += extraBudget.morecolorThanMana.twoMore;
  }

  // large commitment in one color gets more budget
  const colorCounts = colors.map((color) => color.count);
  const maxColorCount = Math.max(...colorCounts);
  if (maxColorCount === 2) {
    budget += extraBudget.inOneColor.two;
  } else if (maxColorCount === 3) {
    budget += extraBudget.inOneColor.three;
  } else if (maxColorCount >= 4) {
    budget += extraBudget.inOneColor.four;
  }

  // multi-colored cards get more budget
  if (colors.length === 2) {
    budget += extraBudget.multiColor.two;
  }
  if (colors.length === 3) {
    budget += extraBudget.multiColor.three;
  }
  if (colors.length >= 4) {
    budget += extraBudget.multiColor.four;
  }

  return budget;
}

export function getActionsBudget(actions: ActionDefinition[]): number {
  let totalBudget = 0;

  for (const action of actions) {
    const baseEffect = getBaseEffect(action.effect.name);
    if (baseEffect) {
      totalBudget += baseEffect.budget(action.effect.args, action.targets || []);
    }
  }

  return totalBudget;
}

export function getTargetCount(targets: TargetDefinition[]): number {
  return targets.reduce((acc, target) => acc + (target.count || 1), 0);
}

export const getRangeMultiplier = (range: UnitFilterArgs) => {
  if (!range) return 1;
  let mulitplier = 1;
  if (range.adjacent) mulitplier += 1.5;
  if (range.sameRow) mulitplier += 1;
  if (range.sameColumn) mulitplier += 1;
  return mulitplier;
};

export const counterCost: Record<CounterType, number> = {
  [CounterType.Growth]: 3,
  [CounterType.Decay]: 3,
  [CounterType.Energy]: 2,
  [CounterType.Rage]: 2,
};

export const statusCost: Record<keyof UnitStatuses, number> = {
  poison: 6,
  mezz: 8,
  root: 4,
  stun: 12,
};
