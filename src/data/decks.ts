import type { CardTemplate, LandTemplate } from '@/lib/_model';
import { cards } from './cards';
import { lands } from './lands';

export const PLAYER_DECK: CardTemplate[] = [
  cards.grizzly_bear,
  cards.grizzly_bear,
  cards.dryad,
  cards.dryad,
  cards.snek,
  cards.snek,
  cards.young_ent,
  cards.young_ent,
  cards.wall_of_bramble,
  cards.wall_of_bramble,
  cards.dwarfBerserker,
  cards.dwarfBerserker,
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
  lands.forest,
  lands.forest,
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
