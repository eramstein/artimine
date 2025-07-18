import type { CardTemplate, LandTemplate } from '@/lib/_model';
import { cards } from './cards';
import { lands } from './lands';

export const PLAYER_DECK: CardTemplate[] = [
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lightningBolt,
  cards.lightningBolt,
  cards.lightningBolt,
  cards.lightningBolt,
  cards.lightningBolt,
  cards.lightningBolt,
  cards.lightningBolt,
  cards.lightningBolt,
  cards.lightningBolt,
  cards.lightningBolt,
  cards.lightningBolt,
  cards.lightningBolt,
];

export const PLAYER_LANDS: LandTemplate[] = [
  lands.mountain,
  lands.mountain,
  lands.mountain,
  lands.mountain,
];

export const FOE_DECK: CardTemplate[] = [
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
  cards.lion,
];

export const FOE_LANDS: LandTemplate[] = [
  lands.mountain,
  lands.mountain,
  lands.mountain,
  lands.mountain,
];
