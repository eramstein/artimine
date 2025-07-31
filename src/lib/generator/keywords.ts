import type { CardColor, UnitCard, UnitKeywords } from '../_model';
import { getRandomWeighted } from '../_utils/random';
import { getDominantColor } from './_utils';
import { keywordColorPreferences } from './color-pie';

// Keyword configuration to eliminate repetition
interface KeywordDefinition {
  type?: 'number'; // boolean is default, only specify for numeric keywords
  baseCost: number;
  prevalence: number;
  scalesWithPower?: boolean;
  requiresSomePower?: boolean;
  requiresSomeHealth?: boolean;
}

const keywordConfig: Record<keyof UnitKeywords, KeywordDefinition> = {
  ranged: { baseCost: 3, prevalence: 8 },
  haste: { baseCost: 2, scalesWithPower: true, requiresSomePower: true, prevalence: 3 },
  moveAndAttack: { baseCost: 2, scalesWithPower: true, requiresSomePower: true, prevalence: 3 },
  retaliate: { type: 'number', baseCost: 1, prevalence: 9, requiresSomeHealth: true },
  armor: { type: 'number', baseCost: 3, prevalence: 6 },
  resist: { type: 'number', baseCost: 2, prevalence: 6 },
  poisonous: { type: 'number', baseCost: 3, prevalence: 3 },
  regeneration: { type: 'number', baseCost: 2, prevalence: 3, requiresSomeHealth: true },
  trample: { baseCost: 3, prevalence: 4, requiresSomePower: true },
  zerk: { baseCost: -3, prevalence: 1, requiresSomePower: true },
};

// Extract prevalence from definitions
const keywordPrevalence: Record<keyof UnitKeywords, number> = Object.fromEntries(
  Object.entries(keywordConfig).map(([key, def]) => [key, def.prevalence])
) as Record<keyof UnitKeywords, number>;

// keywords costs depend on the unit sometimes (e.g. haste is more expensive for a 5/1 unit than a 1/1 unit)
// for keywords with numeric values this is the cost of 1 point
function costPerKeywordForUnit(unit: Partial<UnitCard>): Record<keyof UnitKeywords, number> {
  const colorPieTax = 2;
  const dominantColor = getDominantColor(unit.colors ?? []);
  const colorPrefs = keywordColorPreferences[dominantColor];

  const costs = {} as Record<keyof UnitKeywords, number>;

  Object.entries(keywordConfig).forEach(([key, def]) => {
    const keywordKey = key as keyof UnitKeywords;
    let cost = def.baseCost;

    // Add power scaling if applicable
    if (def.scalesWithPower) {
      cost += Math.floor((unit.power ?? 0) / 2);
    }

    // Add color tax if not in color preferences
    const hasColorPreference = colorPrefs?.[keywordKey] !== undefined;
    const isScalingKeyword = def.type === 'number';
    const colorTax = hasColorPreference ? 0 : isScalingKeyword ? 1 : colorPieTax;

    costs[keywordKey] = cost + colorTax;
  });

  return costs;
}

function prevalencesForUnit(
  dominantcolor: CardColor,
  unit: Partial<UnitCard>
): {
  key: keyof UnitKeywords;
  value: number;
}[] {
  const prevalences: { key: keyof UnitKeywords; value: number }[] = Object.entries(
    keywordPrevalence
  ).map(([key, value]) => {
    // add color preferences to prevalences
    let baseVal =
      value + (keywordColorPreferences[dominantcolor]?.[key as keyof UnitKeywords] ?? 0);
    // special cases
    if (keywordConfig[key as keyof UnitKeywords].requiresSomePower && (unit.power ?? 0) < 1) {
      baseVal = Math.min(baseVal, 1);
    }
    if (keywordConfig[key as keyof UnitKeywords].requiresSomeHealth && (unit.maxHealth ?? 0) < 3) {
      baseVal = Math.min(baseVal, 1);
    }
    return {
      key: key as keyof UnitKeywords,
      value: baseVal,
    };
  }) as { key: keyof UnitKeywords; value: number }[];
  return prevalences;
}

export function getKeywords(
  budget: number,
  unit: Partial<UnitCard>,
  suggestedKeywords: string[]
): { keywords: UnitKeywords; unusedBudget: number } {
  const keywords: UnitKeywords = {};

  const colors = unit.colors ?? [];
  const dominantColor = getDominantColor(colors);

  // probabilities for each keyword
  const prevalences = prevalencesForUnit(dominantColor, unit);
  const suggestedKeywordsSet = new Set(suggestedKeywords);
  prevalences.forEach(({ key }, index) => {
    if (suggestedKeywordsSet.has(key)) {
      prevalences[index].value += 10;
    }
  });

  // budget costs
  const costs = costPerKeywordForUnit(unit);
  const affordableKeywords = prevalences.filter(({ key }) => costs[key] <= budget);
  if (affordableKeywords.length === 0) {
    return { keywords: {}, unusedBudget: budget };
  }

  // select keyword
  const selectedKeyword = getRandomWeighted(
    affordableKeywords.map(({ key, value }) => ({
      item: key,
      weight: value,
    }))
  ) as keyof UnitKeywords;
  const selectedKeywordCost = Math.max(1, costs[selectedKeyword]);
  if (keywordConfig[selectedKeyword].type === 'number') {
    const value = Math.floor(budget / selectedKeywordCost);
    if (value > 0) {
      (keywords as any)[selectedKeyword] = value;
      budget -= selectedKeywordCost * value;
    }
  } else {
    (keywords as any)[selectedKeyword] = true;
    budget -= selectedKeywordCost;
  }

  return { keywords, unusedBudget: budget };
}
