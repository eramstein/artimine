import type { CardTemplate, LandTemplate } from '@/lib/_model';

import cardsData from './cards.json';
import landsData from './lands.json';
import decksData from './decks.json';

export const cards: Record<string, CardTemplate> = cardsData as Record<string, CardTemplate>;
export const lands: Record<string, LandTemplate> = landsData as Record<string, LandTemplate>;

export const PLAYER_DECK = decksData.player.cards.map((cardId) => cards[cardId]);
export const PLAYER_LANDS = decksData.player.lands.map((landId) => lands[landId]);
export const FOE_DECK = decksData.foe.cards.map((cardId) => cards[cardId]);
export const FOE_LANDS = decksData.foe.lands.map((landId) => lands[landId]);

export const PLAYER_NAME = decksData.player.name;
export const FOE_NAME = decksData.foe.name;
