import { CardColor, CardRarity, CardType } from '../_model';
import { getRandomFromArray, getRandomWeighted } from '../_utils/random';
import { MOCK_BATCH } from './_sample-batch';
import { getKeywordSuggestion } from './keywords';
import { generatePrompt } from './llm-card-extension';

export interface BaseTemplate {
  rarity?: CardRarity;
  type?: CardType;
  cost?: number;
  colors?: { color: CardColor; count: number }[];
}

export interface ColorCombo {
  name: string;
  combo: CardColor[];
  flavor: string;
}

export enum ColorComboName {
  Chaos = 'Chaos',
  Control = 'Control',
  Life = 'Life',
  Death = 'Death',
  Araby = 'Araby',
  Midguard = 'Midguard',
  Reik = 'Reik',
  Kislev = 'Kislev',
  Italia = 'Italia',
  Hibernia = 'Hibernia',
}

const colorCombosMap = {
  [ColorComboName.Chaos]: {
    name: ColorComboName.Chaos,
    combo: [CardColor.Red],
    flavor: 'Chaos, aggression, fire, greed, riches, war, raiding',
  },
  [ColorComboName.Control]: {
    name: ColorComboName.Control,
    combo: [CardColor.Blue],
    flavor: 'Control, science, technology, mystery, trickery',
  },
  [ColorComboName.Life]: {
    name: ColorComboName.Life,
    combo: [CardColor.Green],
    flavor: 'Nature, forests, animals, wilderness, growth, healing',
  },
  [ColorComboName.Death]: {
    name: ColorComboName.Death,
    combo: [CardColor.Black],
    flavor: 'Industry, defense, steel, order, undeads, death, necromancy',
  },
  [ColorComboName.Araby]: {
    name: ColorComboName.Araby,
    combo: [CardColor.Red, CardColor.Blue],
    flavor: 'Arabic themes and mythology, 1001 nights',
  },
  [ColorComboName.Midguard]: {
    name: ColorComboName.Midguard,
    combo: [CardColor.Red, CardColor.Green],
    flavor: 'Midgard, Norse mythology, vikings, giants, dwarves, trolls, kobolds',
  },
  [ColorComboName.Reik]: {
    name: ColorComboName.Reik,
    combo: [CardColor.Red, CardColor.Black],
    flavor: 'Holy Roman Empire, gothic, ruthless, central european themes and mythology',
  },
  [ColorComboName.Kislev]: {
    name: ColorComboName.Kislev,
    combo: [CardColor.Blue, CardColor.Green],
    flavor: 'Eastern european themes and mythology, cold, resilience, force and mystery of nature',
  },
  [ColorComboName.Italia]: {
    name: ColorComboName.Italia,
    combo: [CardColor.Blue, CardColor.Black],
    flavor: 'Italian medieval themes and mythology, steam punk touch',
  },
  [ColorComboName.Hibernia]: {
    name: ColorComboName.Hibernia,
    combo: [CardColor.Green, CardColor.Black],
    flavor: 'Celtic themes and mythology, forests, corrupted nature, druids, treemen, dark magic',
  },
};

// this creates a batch of cards squletons so that we have a balanced ratio of colors, rarity, type and costs
export function makeTemplatesBatch() {
  const templates: Partial<Record<ColorComboName, BaseTemplate[]>> = {};
  for (const colorCombo of Object.values(colorCombosMap)) {
    // 3 monocolor cards for one gold
    const prevalence = colorCombo.combo.length === 1 ? 3 : 1;
    let newTemplates: BaseTemplate[] = [];
    for (let i = 0; i < prevalence; i++) {
      newTemplates = [...newTemplates, ...addRarity({ colors: colorCombo })];
    }
    templates[colorCombo.name] = newTemplates;
  }
  // TODO:
  // LOOP AND PASS to LLM - generateCardExtensions
  console.log(templates.Life?.filter((t) => t.rarity === CardRarity.Common));
  const sample = [];
  for (let i = 0; i < 40; i++) {
    sample.push(
      getRandomFromArray(templates.Life?.filter((t) => t.rarity === CardRarity.Common) || [])
    );
  }
  console.log(sample.sort((a, b) => a.cost - b.cost));
  const llmInput = MOCK_BATCH.map((v) => ({
    rarity: v.rarity as CardRarity,
    cost: v.cost,
    type: v.type as CardType,
    keywords: [getKeywordSuggestion(v.colors[0].color as CardColor, v.rarity as CardRarity)].join(
      ', '
    ),
  }));
  console.log(llmInput);
  const prompt = generatePrompt(llmInput, colorCombosMap[ColorComboName.Life].flavor);
  console.log(prompt);
  return templates;
}

function addRarity({ colors }: { colors: ColorCombo }) {
  let templates: BaseTemplate[] = [];
  // 1 common for 1 uncommon for 1 rare
  for (const rarity of [CardRarity.Common, CardRarity.Uncommon, CardRarity.Rare]) {
    const newTemplates = addType({ colors, rarity });
    templates = [...templates, ...newTemplates];
  }
  return templates;
}

function addType({ colors, rarity }: { colors: ColorCombo; rarity: CardRarity }) {
  let templates: BaseTemplate[] = [];
  // 3 units for 1 spell
  let newTemplates: BaseTemplate[] = [];
  newTemplates = [...newTemplates, ...addCost({ colors, rarity, type: CardType.Unit })];
  newTemplates = [...newTemplates, ...addCost({ colors, rarity, type: CardType.Unit })];
  newTemplates = [...newTemplates, ...addCost({ colors, rarity, type: CardType.Spell })];
  templates = [...templates, ...newTemplates];
  return templates;
}

function addCost({
  colors,
  rarity,
  type,
}: {
  colors: ColorCombo;
  rarity: CardRarity;
  type: CardType;
}) {
  let templates: BaseTemplate[] = [];
  for (const cost of [1, 8]) {
    templates.push({
      colors: colors.combo.map((color) => ({
        color,
        count: getRandomColorCost(colors.combo.length),
      })),
      rarity,
      type,
      cost,
    });
  }
  for (const cost of [6, 7]) {
    for (let i = 0; i < 2; i++) {
      templates.push({
        colors: colors.combo.map((color) => ({
          color,
          count: getRandomColorCost(colors.combo.length),
        })),
        rarity,
        type,
        cost,
      });
    }
  }
  for (const cost of [2, 3, 4, 5]) {
    for (let i = 0; i < 3; i++) {
      templates.push({
        colors: colors.combo.map((color) => ({
          color,
          count: getRandomColorCost(colors.combo.length),
        })),
        rarity,
        type,
        cost,
      });
    }
  }
  return templates;
}

function getRandomColorCost(colorCount: number) {
  if (colorCount === 1) {
    return getRandomWeighted([
      { item: 1, weight: 3 },
      { item: 2, weight: 3 },
      { item: 3, weight: 2 },
      { item: 4, weight: 1 },
    ]);
  }
  if (colorCount === 2) {
    return getRandomWeighted([
      { item: 1, weight: 3 },
      { item: 2, weight: 3 },
      { item: 3, weight: 1 },
    ]);
  }
  if (colorCount === 3) {
    return getRandomWeighted([
      { item: 1, weight: 3 },
      { item: 2, weight: 2 },
    ]);
  }
  return getRandomWeighted([
    { item: 1, weight: 3 },
    { item: 2, weight: 1 },
  ]);
}
