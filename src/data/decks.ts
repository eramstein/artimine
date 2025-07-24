import type { CardTemplate, LandTemplate } from '@/lib/_model';
import { cards } from './cards';
import { lands } from './lands';

export const PLAYER_DECK: CardTemplate[] = [
  cards.raise_dead,
  cards.lord_of_shrooms,
  cards.shroomy,
  cards.ebonheart,
  cards.shroomy_shooty,
  cards.shroomy_protecs,
  cards.shroomy_rooty,
  cards.lightning_bolt,
  cards.energyze,
  cards.luxurious_growth,
  cards.modis_chosen,
  cards.grizzly_bear,
  cards.dryad,
  cards.dryad,
  cards.snek,
  cards.young_ent,
  cards.wall_of_bramble,
  cards.modis_chosen,
  cards.dwarf_berserker,
  cards.deep_forest_wurm,
  cards.basic_wurm,
];

export const PLAYER_LANDS: LandTemplate[] = [
  lands.forest,
  lands.forest,
  lands.swamp,
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
