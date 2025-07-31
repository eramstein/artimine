/* 
  This is managing how many "points" a card gets based on its cost.
  Points can then be used to get power, health, keywords and abilities.
*/

import { config } from '../_config';
import type { CardColor, UnitKeywords } from '../_model';

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
  if (maxColorCount === 3) {
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
