import type { Deck } from '@/lib/_model';

export const TEST_DECK: Deck = {
  key: 'test',
  name: 'Test',
  cards: [
    {
      cardTemplateId: 'orc_miner',
      count: 20,
    },
    {
      cardTemplateId: 'hobbit_gardener',
      count: 20,
    },
  ],
  //lands: ['forest', 'market', 'city', 'mountain'],
  lands: ['unstable_lab', 'unstable_lab', 'unstable_lab', 'unstable_lab'],
};

export const BASE_DECK: Deck = {
  key: 'base',
  name: 'Base',
  cards: [
    {
      cardTemplateId: 'hobbit_gardener',
      count: 2,
    },
    {
      cardTemplateId: 'snek',
      count: 2,
    },
    {
      cardTemplateId: 'ferocious_badger',
      count: 1,
    },
    {
      cardTemplateId: 'boring_boar',
      count: 2,
    },
    {
      cardTemplateId: 'gaul_brawler',
      count: 1,
    },
    {
      cardTemplateId: 'young_hobbit',
      count: 2,
    },
    {
      cardTemplateId: 'red_haired_bard',
      count: 1,
    },
    {
      cardTemplateId: 'giant_growth',
      count: 1,
    },
    {
      cardTemplateId: 'hobbit_villager',
      count: 2,
    },
    {
      cardTemplateId: 'shroomy',
      count: 2,
    },
    {
      cardTemplateId: 'execution',
      count: 1,
    },
    {
      cardTemplateId: 'expendable_recruit',
      count: 2,
    },
    {
      cardTemplateId: 'hans_is_back',
      count: 1,
    },
    {
      cardTemplateId: 'banshee',
      count: 1,
    },
    {
      cardTemplateId: 'ebonheart',
      count: 1,
    },
    {
      cardTemplateId: 'mycosed_bear',
      count: 2,
    },
    {
      cardTemplateId: 'the_black_knight',
      count: 1,
    },
    {
      cardTemplateId: 'malevolent_druid',
      count: 1,
    },
    {
      cardTemplateId: 'benevolent_druid',
      count: 1,
    },
    {
      cardTemplateId: 'not_a_fox',
      count: 1,
    },
    {
      cardTemplateId: 'raise_dead',
      count: 1,
    },
    {
      cardTemplateId: 'dark_remedy',
      count: 1,
    },
    {
      cardTemplateId: 'what_doesnt_kill',
      count: 1,
    },
  ],
  lands: ['market', 'city', 'plains', 'forest'],
};

export const BASE_DECK_ITALIA: Deck = {
  key: 'base_italia',
  name: 'Italian Deck',
  cards: [
    {
      cardTemplateId: 'fat_pigeon',
      count: 2,
    },
    {
      cardTemplateId: 'grenadier',
      count: 2,
    },
    {
      cardTemplateId: 'sewer_rat',
      count: 2,
    },
    {
      cardTemplateId: 'expendable_recruit',
      count: 2,
    },
    {
      cardTemplateId: 'market_beggar',
      count: 2,
    },
    {
      cardTemplateId: 'street_slinger',
      count: 3,
    },
    {
      cardTemplateId: 'benevolent_monk',
      count: 2,
    },
    {
      cardTemplateId: 'grim_guard',
      count: 2,
    },
    {
      cardTemplateId: 'vigilant_knight',
      count: 2,
    },
    {
      cardTemplateId: 'angry_mob',
      count: 1,
    },
    {
      cardTemplateId: 'city_guard',
      count: 2,
    },
    {
      cardTemplateId: 'gate_keepers',
      count: 2,
    },
    {
      cardTemplateId: 'coal_demon',
      count: 1,
    },
    {
      cardTemplateId: 'royal_halberdier',
      count: 1,
    },
    {
      cardTemplateId: 'clunky_golem',
      count: 1,
    },
    {
      cardTemplateId: 'bob_the_blob',
      count: 1,
    },
    {
      cardTemplateId: 'shameless_imitator',
      count: 1,
    },
    {
      cardTemplateId: 'eagle_mounted_archers',
      count: 1,
    },
  ],
  lands: ['island', 'city', 'plains', 'market'],
};

export const BASE_DECK_MIDGUARD: Deck = {
  key: 'base_midguard',
  name: 'Midguard',
  cards: [
    {
      cardTemplateId: 'hungry_hermit',
      count: 3,
    },
    {
      cardTemplateId: 'young_viking',
      count: 3,
    },
    {
      cardTemplateId: 'swift_drakkar',
      count: 3,
    },
    {
      cardTemplateId: 'shield_maiden',
      count: 3,
    },
    {
      cardTemplateId: 'northern_challenger',
      count: 3,
    },
    {
      cardTemplateId: 'snow_troll',
      count: 3,
    },
    {
      cardTemplateId: 'odins_chosen',
      count: 1,
    },
    {
      cardTemplateId: 'havrhell',
      count: 1,
    },
    {
      cardTemplateId: 'viking_banner',
      count: 2,
    },
    {
      cardTemplateId: 'enraged_goblin',
      count: 1,
    },
    {
      cardTemplateId: 'hill_troll',
      count: 3,
    },
    {
      cardTemplateId: 'rock_elemental',
      count: 1,
    },
    {
      cardTemplateId: 'frenzied_shaman',
      count: 1,
    },
    {
      cardTemplateId: 'drake',
      count: 1,
    },
    {
      cardTemplateId: 'bear_minimum',
      count: 1,
    },
  ],
  lands: ['forest', 'mountain', 'plains', 'market'],
};

export const BASE_DECK_ARABIA: Deck = {
  key: 'base_arabia',
  name: 'Arabia',
  cards: [
    {
      cardTemplateId: 'whirling_dervishes',
      count: 3,
    },
    {
      cardTemplateId: 'fishermans_ifrit',
      count: 3,
    },
    {
      cardTemplateId: 'alahmar_djinn',
      count: 3,
    },
    {
      cardTemplateId: 'sherazad',
      count: 1,
    },
    {
      cardTemplateId: 'clunky_golem',
      count: 3,
    },
    {
      cardTemplateId: 'cowardly_mage',
      count: 3,
    },
    {
      cardTemplateId: 'arc_lightning_specialist',
      count: 2,
    },
    {
      cardTemplateId: 'albatros',
      count: 1,
    },
    {
      cardTemplateId: 'peaceful_faerie',
      count: 1,
    },
    {
      cardTemplateId: 'shameless_imitator',
      count: 1,
    },
    {
      cardTemplateId: 'zeppelin',
      count: 1,
    },
    {
      cardTemplateId: 'lunging_cougar',
      count: 1,
    },
    {
      cardTemplateId: 'mountain_giant',
      count: 2,
    },
    {
      cardTemplateId: 'hill_troll',
      count: 1,
    },
    {
      cardTemplateId: 'kobold_slinger',
      count: 2,
    },
    {
      cardTemplateId: 'dwarf_berserker',
      count: 2,
    },
  ],
  lands: ['plains', 'market', 'island', 'mountain'],
};

export const BASE_DECK_REIK: Deck = {
  key: '159c2238-c2f6-4a4a-b19e-017176d32d6b',
  name: 'Teutonic',
  cards: [
    {
      cardTemplateId: 'vengeful_crusader',
      count: 3,
    },
    {
      cardTemplateId: 'watch_tower',
      count: 3,
    },
    {
      cardTemplateId: 'teutonic_knight',
      count: 3,
    },
    {
      cardTemplateId: 'trebuchet',
      count: 3,
    },
    {
      cardTemplateId: 'flammen_werfer',
      count: 3,
    },
    {
      cardTemplateId: 'frankish_castle',
      count: 3,
    },
    {
      cardTemplateId: 'golgoth',
      count: 1,
    },
    {
      cardTemplateId: 'sewer_rat',
      count: 2,
    },
    {
      cardTemplateId: 'expendable_recruit',
      count: 2,
    },
    {
      cardTemplateId: 'market_beggar',
      count: 2,
    },
    {
      cardTemplateId: 'street_slinger',
      count: 2,
    },
    {
      cardTemplateId: 'angry_mob',
      count: 1,
    },
    {
      cardTemplateId: 'orc_miner',
      count: 3,
    },
    {
      cardTemplateId: 'vigilant_knight',
      count: 2,
    },
    {
      cardTemplateId: 'city_guard',
      count: 2,
    },
    {
      cardTemplateId: 'gate_keepers',
      count: 2,
    },
    {
      cardTemplateId: 'iron_golem',
      count: 2,
    },
    {
      cardTemplateId: 'big_bertha',
      count: 1,
    },
  ],
  lands: ['city', 'market', 'plains', 'mountain'],
};

export const BASE_DECK_KISLEV: Deck = {
  key: '0639f6e7-3a07-4e5c-a0ca-86f76871c167',
  name: 'Kislev',
  cards: [
    {
      cardTemplateId: 'taiga_rangers',
      count: 3,
    },
    {
      cardTemplateId: 'glacial_guard',
      count: 3,
    },
    {
      cardTemplateId: 'greedy_bear',
      count: 1,
    },
    {
      cardTemplateId: 'bear_riders',
      count: 1,
    },
    {
      cardTemplateId: 'shroomy',
      count: 2,
    },
    {
      cardTemplateId: 'young_hobbit',
      count: 2,
    },
    {
      cardTemplateId: 'wall_of_brambles',
      count: 2,
    },
    {
      cardTemplateId: 'snek',
      count: 2,
    },
    {
      cardTemplateId: 'bear_minimum',
      count: 2,
    },
    {
      cardTemplateId: 'hungry_wolf',
      count: 3,
    },
    {
      cardTemplateId: 'deer',
      count: 2,
    },
    {
      cardTemplateId: 'giant_spider',
      count: 2,
    },
    {
      cardTemplateId: 'ferocious_badger',
      count: 1,
    },
    {
      cardTemplateId: 'bison',
      count: 2,
    },
    {
      cardTemplateId: 'mega_moss_monster',
      count: 1,
    },
    {
      cardTemplateId: 'ent',
      count: 1,
    },
  ],
  lands: ['island', 'forest', 'plains', 'market'],
};
