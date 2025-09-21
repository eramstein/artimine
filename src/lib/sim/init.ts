import { CHARACTERS } from '@/data/characters/main';
import { CHARACTER_PLAYER } from '@/data/characters/player';
import { PLACES } from '@/data/places/places';
import type { GameState } from '../_model';
import { CardSet } from '../_model/enums-battle';
import { ActivityType, DayPeriod, ItemType, TournamentType } from '../_model/enums-sim';
import { gs } from '../_state/main.svelte';
import { openBoosterForCharacter } from './booster';
import { getCollectionFromDeck } from './collection';
import { fillDefaultActivities } from './schedule';
import { getTournament } from './tournament';

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
  activityPlans: [],
  chat: null,
};

export const initSim = async () => {
  // CARD COLLECTIONS
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
    {
      key: 'starter_alpha',
      name: 'Starter',
      type: ItemType.StarterDeck,
      price: 40,
      variant: CardSet.Alpha,
    },
  ];
  gs.player.cash = 100;

  // CHAT INITIATION
  const dude = gs.characters['the-dude'];
  dude!.chatInitiation = `The Dude: whoa, it's the master of ceremonies himself, ${gs.player.name}! You should try this new game I have in store. It's called Hordes, and it's good stuff, man.`;

  // ACTIVITIES
  gs.player.place = goblinCave!.index;
  const othersAtCave = Object.values(gs.characters).filter(
    (c) => c.key !== gs.player.key && c.place === goblinCave!.index
  );
  // we start gaming at the Cave
  gs.activity = {
    activityType: ActivityType.Gaming,
    participants: [gs.player.key, ...othersAtCave.map((c) => c.key)],
  };
  fillDefaultActivities(9);
  // next Sunday's local tournament
  gs.activityPlans[8][1] = {
    activity: {
      activityType: ActivityType.Tournament,
      participants: [gs.player.key, ...othersAtCave.map((c) => c.key)],
      tournament: getTournament(gs.activity.participants, TournamentType.Swiss, 3),
    },
    day: 8,
    dayPeriod: DayPeriod.Afternoon,
    place: goblinCave!.index,
  };
};
