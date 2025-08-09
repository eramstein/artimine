import type { CardTemplate, LandTemplate } from '@/lib/_model';

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
      const landModule = await import(`./lands/${landId}.json`);
      lands[landId] = landModule.default as LandTemplate;
    } catch (error) {
      console.error(`Failed to load land: ${landId}`, error);
    }
  }
}

// These functions will return the deck data after loading
export const PLAYER_DECK = () => decksData.player.cards.map((cardId) => cards[cardId]);
export const PLAYER_LANDS = () => decksData.player.lands.map((landId) => lands[landId]);
export const FOE_DECK = () => decksData.foe.cards.map((cardId) => cards[cardId]);
export const FOE_LANDS = () => decksData.foe.lands.map((landId) => lands[landId]);

export const PLAYER_NAME = decksData.player.name;
export const FOE_NAME = decksData.foe.name;
