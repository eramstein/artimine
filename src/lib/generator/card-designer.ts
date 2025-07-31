import type { CardColor, UnitCard, UnitKeywords } from '../_model';
import { MOCK_BASE_CARDS } from './_mocks';
import { baseStatsCost, getBudgetForUnit } from './budgets';
import { type BaseTemplate } from './card-batches';
import { getDominantColor } from './_utils';
import { powerAndHealthPreferences } from './color-pie';
import { clamp, getRandomIntegerWithVariance } from '../_utils/random';
import { getKeywords } from './keywords';
import type { LllmExtendedCard } from './llm-card-extension';

export function generateUnitCard(baseCard: LllmExtendedCard = MOCK_BASE_CARDS[0]): UnitCard {
  console.log('TODO: generateCard', baseCard);
  const createdUnit: Partial<UnitCard> = { ...baseCard };

  // get total budget for unit
  let budget = getBudgetForUnit(baseCard.cost ?? 1, baseCard.colors ?? []);

  // spend points for power and health
  const { power, health } = getPowerAndHealth(budget, baseCard.colors ?? []);
  createdUnit.power = power;
  createdUnit.maxHealth = health;
  budget -= power * baseStatsCost.power + health * baseStatsCost.health;

  // spend points for keywords
  const { keywords, unusedBudget } = getKeywords(
    budget,
    createdUnit,
    baseCard.llmData?.suggestedKeywords ?? []
  );
  createdUnit.keywords = keywords;
  budget += unusedBudget;

  // spend points for abilities
  // TODO:

  console.log('createdUnit', createdUnit);
}

function getPowerAndHealth(
  budget: number,
  colors: { color: CardColor; count: number }[]
): { power: number; health: number } {
  const variance = 0.2;
  const dominantColor = getDominantColor(colors);
  const preferences = powerAndHealthPreferences[dominantColor];
  const standardBudget = budget * (preferences.power + preferences.health);
  const allocatedBudget = clamp(getRandomIntegerWithVariance(standardBudget, variance), 0, budget);
  const powerBudget = clamp(
    getRandomIntegerWithVariance(allocatedBudget * preferences.power, variance),
    0,
    allocatedBudget
  );
  const healthBudget = clamp(allocatedBudget - powerBudget, 0, allocatedBudget);
  const power = Math.floor(powerBudget / baseStatsCost.power);
  const health = Math.floor(healthBudget / baseStatsCost.health);
  return { power, health };
}
