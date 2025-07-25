import type { CardTemplate, LandTemplate } from '@/lib/_model';
import { cards } from './cards';
import { lands } from './lands';

export const PLAYER_DECK: CardTemplate[] = [
  cards.zombie,
  cards.mosquito,
  cards.shroomy_rooty,
  cards.guinea_pig,
  cards.decaying_ray,
  cards.lightning_bolt,
  cards.raise_dead,
  cards.lord_of_shrooms,
  cards.shroomy,
  cards.ebonheart,
  cards.shroomy_shooty,
  cards.shroomy_protecs,
  cards.energyze,
  cards.luxurious_growth,
  cards.grizzly_bear,
  cards.dryad,
  cards.snek,
  cards.young_ent,
  cards.wall_of_bramble,
  cards.modis_chosen,
  cards.dwarf_berserker,
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
