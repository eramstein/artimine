import { CardRarity, type CardColor, type UnitCard, type UnitKeywords } from '../../lib/_model';
import { MOCK_BASE_CARDS } from './_mocks';
import { baseStatsCost, getBudgetForUnit } from './budgets';
import { type BaseTemplate } from './card-batches';
import { getDominantColor } from './_utils';
import { powerAndHealthPreferences } from './color-pie';
import { clamp, getRandomIntegerWithVariance } from '../../lib/_utils/random';
import { getKeywords } from './keywords';
import type { LllmExtendedCard } from './llm-card-extension';

export function generateUnitCard(
  baseCard: LllmExtendedCard = MOCK_BASE_CARDS[3]
): Partial<UnitCard> {
  console.log('TODO: generateCard', baseCard);
  const createdUnit: Partial<UnitCard> = { ...baseCard };

  // get total budget for unit
  let budget = getBudgetForUnit(baseCard.cost ?? 1, baseCard.colors ?? []);
  console.log('budget', budget);

  // spend points for power and health
  const { power, health } = getPowerAndHealth(
    budget,
    baseCard.rarity ?? CardRarity.Common,
    baseCard.colors ?? []
  );
  for (let i = 0; i < 10; i++) {
    const { power, health } = getPowerAndHealth(
      budget,
      baseCard.rarity ?? CardRarity.Common,
      baseCard.colors ?? []
    );
  }
  createdUnit.power = power;
  createdUnit.maxHealth = health;
  budget -= power * baseStatsCost.power + health * baseStatsCost.health;
  console.log('budget after power and health', budget);

  // spend points for keywords
  const { keywords, unusedBudget } = getKeywords(
    budget,
    createdUnit,
    baseCard.llmData?.suggestedKeywords ?? []
  );
  createdUnit.keywords = keywords;
  budget = unusedBudget;
  console.log('budget after keywords', budget);

  // spend points for abilities
  // TODO:

  console.log('createdUnit', createdUnit);
  return createdUnit;
}

function getPowerAndHealth(
  budget: number,
  rarity: CardRarity,
  colors: { color: CardColor; count: number }[]
): { power: number; health: number } {
  const variance = budget;
  const dominantColor = getDominantColor(colors);
  const preferences = powerAndHealthPreferences[dominantColor];
  let standardBudget = budget * (preferences.power + preferences.health);
  if (budget > 30) {
    standardBudget -= 5;
  }
  if (rarity === CardRarity.Uncommon) {
    standardBudget -= 2;
  }
  if (rarity === CardRarity.Rare) {
    standardBudget -= 5;
  }
  if (rarity === CardRarity.Legendary) {
    standardBudget -= 5;
  }
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
