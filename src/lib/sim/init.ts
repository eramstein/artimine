import { BASE_DECK } from '@/data/base-deck';
import { CHARACTERS } from '@/data/characters/main';
import { CHARACTER_PLAYER } from '@/data/characters/player';
import { PLACES } from '@/data/places/places';
import type { GameState } from '../_model';
import { CardSet } from '../_model/enums-battle';
import { ActivityType, DayPeriod, ItemType } from '../_model/enums-sim';
import { gs } from '../_state/main.svelte';
import { openBoosterForCharacter } from './booster';
import { getCollectionFromDeck, getFullCollection } from './collection';
import { fillDefaultActivities } from './schedule';

export const defaultGameState: GameState = {
  time: {
    day: 0,
    period: DayPeriod.Afternoon,
  },
  characters: CHARACTERS,
  player: {
    ...CHARACTER_PLAYER,
    collection: [],
    decks: [],
    cash: 0,
    items: [],
    studyPoints: 0,
    attributes: {
      intelligence: 7,
      charisma: 5,
      vitality: 3,
      dexterity: 5,
    },
  },
  places: PLACES,
  activity: {
    activityType: ActivityType.Chill,
    participants: [],
  },
  activities: [],
  chat: null,
};

export const initSim = async () => {
  // CARD COLLECTION
  gs.player.collection = getFullCollection();
  gs.player.decks = [BASE_DECK];

  for (const character of Object.values(gs.characters)) {
    character.collection = getCollectionFromDeck(character.decks[0]);
    openBoosterForCharacter(character, CardSet.Alpha);
    openBoosterForCharacter(character, CardSet.Alpha);
    openBoosterForCharacter(character, CardSet.Alpha);
  }

  // SHOPS
  const goblinCave = gs.places.find((p) => p.key === 'goblin_counter');
  goblinCave!.shopInventory = [
    {
      key: 'booster_alpha',
      name: 'Booster',
      type: ItemType.Booster,
      price: 10,
      variant: CardSet.Alpha,
    },
  ];
  gs.player.cash = 100;

  // ACTIVITIES
  gs.player.place = goblinCave!.index;
  const othersAtCave = Object.values(gs.characters).filter(
    (c) => c.key !== gs.player.key && c.place === goblinCave!.index
  );
  gs.activity = {
    activityType: ActivityType.Gaming,
    participants: [gs.player.key, ...othersAtCave.map((c) => c.key)],
  };
  fillDefaultActivities();
};
