import { CardColor, CardRarity, CardType, UnitType, type UnitKeywords } from '../_model';
import { type BaseTemplate, type ColorCombo } from './card-batches';

export interface LllmInput {
  rarity?: CardRarity;
  type?: CardType;
  cost?: number;
}

export enum SuggestedSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Huge = 'huge',
}

export interface LllmOutput {
  name: string;
  imageDescription?: string;
  suggestedSize: string;
  suggestedKeywords: string[];
  suggestedUnitType: string;
}

export interface LllmExtendedCard extends BaseTemplate {
  llmData: LllmOutput;
}

const MOCK_INPUT = [
  { type: CardType.Unit, cost: 1, rarity: CardRarity.Common },
  { type: CardType.Unit, cost: 5, rarity: CardRarity.Uncommon },
  { type: CardType.Unit, cost: 2, rarity: CardRarity.Common },
  { type: CardType.Unit, cost: 8, rarity: CardRarity.Rare },
];

const MOCK_OUTPUT = [
  {
    name: 'Thistle Hare',
    imageDescription:
      'A lean, moss-colored hare with thorny antlers bounding through a misty glade under the watchful gaze of gnarled oaks',
    suggestedSize: 'small',
    suggestedKeywords: ['haste'],
    suggestedUnitType: 'beast',
  },
  {
    name: 'Wyrmbark Ancestor',
    imageDescription:
      'A towering treeman with bark scorched by dark runes, holding a staff of twisted vinewood, eyes glowing with old sorrow',
    suggestedSize: 'large',
    suggestedKeywords: ['armor', 'regeneration'],
    suggestedUnitType: 'elemental',
  },
  {
    name: 'Rotglade Vermin',
    imageDescription:
      'A bloated rodent-like creature crawling from a moss-covered stump, dripping dark sap from its fangs',
    suggestedSize: 'small',
    suggestedKeywords: ['poisonous'],
    suggestedUnitType: 'monster',
  },
  {
    name: 'Ashen Wildwyrm',
    imageDescription:
      'A serpentine forest dragon with scorched wings and bark-like scales, wreathed in green fire and wrapped around a ruined stone circle',
    suggestedSize: 'huge',
    suggestedKeywords: ['trample', 'zerk'],
    suggestedUnitType: 'dragon',
  },
];

export function generateCardExtensions(
  templates: BaseTemplate[],
  colorCombo: ColorCombo
): LllmExtendedCard[] {
  const prompt = generatePrompt(templates, colorCombo);
  return MOCK_OUTPUT.map((output, i) => {
    return {
      ...MOCK_INPUT[i],
      llmData: output,
    };
  });
}

export const UNIT_KEYWORDS_KEYS = {
  ranged: true,
  haste: true,
  moveAndAttack: true,
  retaliate: true,
  armor: true,
  resist: true,
  poisonous: true,
  regeneration: true,
  trample: true,
  zerk: true,
} as const;

export const getUnitKeywordKeys = (): (keyof UnitKeywords)[] =>
  Object.keys(UNIT_KEYWORDS_KEYS) as (keyof UnitKeywords)[];

export function generatePrompt(templates: LllmInput[], colorCombo: ColorCombo) {
  return `
  You are a card designer for a medievam-fantsay trading card game. You are creating card names and descriptions of their images, as well as some gameplay recommandations. 

  All cards in this batch share the following theme:  
  **Theme:** ${colorCombo.flavor}  

  All names should be unique (avoid repetition within this batch).  

  You are given a list of cards to create, with the following structure being already given:
  - **Type**: either "unit" (e.g. animals, humans, monsters, magical beings) or "spell" (e.g. effects like sandstorms or illusions)  
  - **Cost**: from 1 to 8; low-cost cards are simple and weak, high-cost ones are powerful and dramatic  
  - **Rarity**: "common", "uncommon", or "rare"; rare cards should feel more legendary and have more exotic names

  ---

  Use only these values for suggested keywords (pick 1 or 2 max per card):  
  ${getUnitKeywordKeys().join(', ')}

  Use only these values for suggested unit type:  
  ${Object.values(UnitType).join(', ')}

  Use only these values for suggested size:  
  ${Object.values(SuggestedSize).join(', ')}

  ---

  Generate cards based on the following input list:
  ${JSON.stringify(templates)}

  ---
  Each output card should follow this structure.
  {
    "name": "Desert Fox",
    "imageDescription": "A fennec darting across golden dunes under a starry sky, ears perked and agile mid-jump",
    "suggestedSize": "small",
    "suggestedKeywords": ["elusive"],
    "suggestedUnitType": "beast"
  }

  The suggestedSize should be inferred from the visual and thematic scale described in the card’s name and imageDescription   — not based on its mana cost. 
  A creature like a “Whispering Sprite” might be small, while something like “Ancient Forest Titan” would be huge.  
`;
}
