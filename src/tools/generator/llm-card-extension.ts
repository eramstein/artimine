import { CardColor, CardRarity, CardType, UnitType, type UnitKeywords } from '../../lib/_model';
import { MOCK_LLM_OUTPUT } from './_mocks';
import { type BaseTemplate, type ColorCombo } from './card-batches';

export interface LllmInput {
  rarity?: CardRarity;
  type?: CardType;
  cost?: number;
  keywords?: string[];
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

export function generateCardExtensions(
  templates: BaseTemplate[],
  flavor: string
): LllmExtendedCard[] {
  const prompt = generatePrompt(templates, flavor);
  return MOCK_LLM_OUTPUT.map((output, i) => {
    return {
      ...MOCK_INPUT[i],
      llmData: output,
    };
  });
}

export function generatePrompt(templates: LllmInput[], flavor: string) {
  return `
  You are a card designer for a medieval fantasy trading card game. You are creating card names and descriptions of their images, as well as some gameplay recommandations. 

  All cards in this batch share the following theme:  
  **Theme:** ${flavor}

  All names should be unique (avoid repetition within this batch).  

  You are given a list of cards to create, with the following structure being already given:
  - **Type**: either "unit" (e.g. animals, humans, monsters, magical beings) or "spell" (e.g. effects like sandstorms or illusions)  
  - **Cost**: from 1 to 8; low-cost cards are simple and weak, high-cost ones are powerful and dramatic  
  - **Rarity**: "common", "uncommon", or "rare"; rare cards should feel more legendary and have more exotic names
  - **Keywords**: a list of keywords that describe the card's abilities

  ---

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
    "suggestedUnitType": "beast"
  }

  The suggestedSize should be inferred from the visual and thematic scale described in the card’s name and imageDescription   — not based on its mana cost. 
  A creature like a “Whispering Sprite” might be small, while something like “Ancient Forest Titan” would be huge.  
`;
}
