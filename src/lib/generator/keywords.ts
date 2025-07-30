import type { CardColor, UnitKeywords } from '../_model';
import { getDominantColor } from './_utils';
import { keywordColorPreferences } from './color-pie';

// Keyword configuration to eliminate repetition
interface KeywordDefinition {
  type?: 'number'; // boolean is default, only specify for numeric keywords
  baseCost: number;
  scalesWithPower?: boolean;
  prevalence: number;
}

const keywordDefs: Record<keyof UnitKeywords, KeywordDefinition> = {
  ranged: { baseCost: 3, prevalence: 8 },
  haste: { baseCost: 2, scalesWithPower: true, prevalence: 6 },
  moveAndAttack: { baseCost: 2, scalesWithPower: true, prevalence: 3 },
  retaliate: { type: 'number', baseCost: 1, prevalence: 9 },
  armor: { type: 'number', baseCost: 3, prevalence: 6 },
  resist: { type: 'number', baseCost: 2, prevalence: 6 },
  poisonous: { type: 'number', baseCost: 3, prevalence: 3 },
  regeneration: { type: 'number', baseCost: 2, prevalence: 3 },
  trample: { baseCost: 3, prevalence: 4 },
  zerk: { baseCost: -3, prevalence: 1 },
};

// Extract prevalence from definitions
export const keywordPrevalence: Record<keyof UnitKeywords, number> = Object.fromEntries(
  Object.entries(keywordDefs).map(([key, def]) => [key, def.prevalence])
) as Record<keyof UnitKeywords, number>;

// keywords costs depend on the unit sometimes (e.g. haste is more expensive for a 5/1 unit than a 1/1 unit)
// for keywords with numeric values this is the cost of 1 point
export function costPerKeywordForUnit(unit: {
  power: number;
  dominantcolor: CardColor;
}): Record<keyof UnitKeywords, number> {
  const colorPieTax = 2;
  const colorPrefs = keywordColorPreferences[unit.dominantcolor];

  const costs = {} as Record<keyof UnitKeywords, number>;

  Object.entries(keywordDefs).forEach(([key, def]) => {
    const keywordKey = key as keyof UnitKeywords;
    let cost = def.baseCost;

    // Add power scaling if applicable
    if (def.scalesWithPower) {
      cost += Math.floor(unit.power / 2);
    }

    // Add color tax if not in color preferences
    const hasColorPreference = colorPrefs?.[keywordKey] !== undefined;
    const isScalingKeyword = def.type === 'number';
    const colorTax = hasColorPreference ? 0 : isScalingKeyword ? 1 : colorPieTax;

    costs[keywordKey] = cost + colorTax;
  });

  return costs;
}

export function getKeywords(
  budget: number,
  colors: { color: CardColor; count: number }[]
): UnitKeywords {
  const keywords: UnitKeywords = {};
  const dominantColor = getDominantColor(colors);
  const prevalences = Object.entries(keywordPrevalence).map(([key, value]) => ({
    key,
    value: value + (keywordColorPreferences[dominantColor]?.[key as keyof UnitKeywords] ?? 0),
  }));
  const costs = costPerKeywordForUnit({ power: 1, dominantcolor: dominantColor });
  console.log('costs', costs);

  return keywords;
}
