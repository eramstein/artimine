import {
  CardType,
  type CardTemplate,
  type LandTemplate,
  type UnitCardTemplate,
} from '@/lib/_model';
import { getRandomFromArray } from '@/lib/_utils/random';
import allCards from './_all_cards.json';

import decksData from './decks.json';

// Get unique card IDs from both decks
const playerCardIds = new Set(decksData.player.cards);
const foeCardIds = new Set(decksData.foe.cards);
const allCardIds = new Set([...playerCardIds, ...foeCardIds]);

// Get unique land IDs from both decks
const playerLandIds = new Set(decksData.player.lands);
const foeLandIds = new Set(decksData.foe.lands);
const allLandIds = new Set([...playerLandIds, ...foeLandIds]);

// Only load cards that are actually used in the decks
export const cards: Record<string, CardTemplate> = {};
export const lands: Record<string, LandTemplate> = {};

// Function to load game data - this will be called when the game starts
export async function loadGameData() {
  // Load individual card files
  for (const cardId of allCardIds) {
    try {
      const cardModule = await import(`./cards/${cardId}.json`);
      cards[cardId] = cardModule.default as CardTemplate;
    } catch (error) {
      console.error(`Failed to load card: ${cardId}`, error);
    }
  }

  // Load individual land files
  for (const landId of allLandIds) {
    try {
      const landModule = await import(`./cards/${landId}.json`);
      lands[landId] = landModule.default as LandTemplate;
    } catch (error) {
      console.error(`Failed to load land: ${landId}`, error);
    }
  }
}

// Returns a random unit card from the full catalog in _all_cards.json
export function getRandomUnitCardFromAll(): UnitCardTemplate {
  return getRandomFromArray(
    allCards.filter((card) => card.type === CardType.Unit) as UnitCardTemplate[]
  );
}
