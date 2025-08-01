import type { CardTemplate, LandTemplate } from '@/lib/_model';
import { cards } from './cards';
import { lands } from './lands';

export const PLAYER_DECK: CardTemplate[] = [
  cards.lightning_bolt,
  cards.decaying_ray,
  cards.raise_dead,
  cards.dark_ritual,
  cards.shroomy_rooty,
  cards.frenzied_shaman,
  cards.tim,
  cards.mycosed_bear,
  cards.grim_guard,
  cards.mosquito,
  cards.shroomy_rooty,
  cards.guinea_pig,
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
