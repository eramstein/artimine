import type { Deck } from '@/lib/_model';

export const CHARACTER_DECKS: Record<string, string> = {
  'the-dude': 'midguard',
  emma: 'italia',
  henry: 'reik',
  molly: 'arabia',
  ousmane: 'kislev',
};

export const TEST_DECK: Deck = {
  key: 'test',
  name: 'Test',
  cards: [
    {
      cardTemplateId: 'ogre_brawler',
      count: 20,
    },
    {
      cardTemplateId: 'sucker_punch',
      count: 20,
    },
    {
      cardTemplateId: 'zizany',
      count: 20,
    },
  ],
  lands: ['forest', 'island', 'city', 'mountain'],
  record: {
    wins: 0,
    losses: 0,
    cardResults: {},
  },
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
  lands: ['market', 'city', 'mountain', 'forest'],
  record: {
    wins: 0,
    losses: 0,
    cardResults: {},
  },
};
