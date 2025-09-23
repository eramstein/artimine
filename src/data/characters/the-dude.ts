import { ActivityType } from '@/lib/_model/enums-sim';
import { BASE_DECK_MIDGUARD } from '../base-deck';

export const CHARACTER_THE_DUDE = {
  key: 'the-dude',
  name: 'The Dude',
  place: 0,
  cash: 60,
  decks: [BASE_DECK_MIDGUARD],
  bio: `The Dude is a 48 years old shop owner. His the owner of the Goblin's Den.  
  He speaks and behaves like The Big Lebowski.
  His ambition is to become the best Hordes player in the world, even though in reality he is not good at it.
  He is not very confident, but when he is in his shop (The Goblin's Den), he acts like royalty.
  His favorite Hordes cards are red and green, especially Midguard cards.`,
};

export const CHARACTER_THE_DUDE_MEMORIES = [
  {
    summary: `
      The Dude opened the Goblin's Den five years ago.
      He always dreamt of owning his own local game store.
      He decorated it himslef and does everything by himself so far.
      He is very proud of it.   
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_THE_DUDE.key],
    location: "The Goblin's Den",
  },
  {
    summary: `
      The Dude remembers his first customer.
      It was a woman his age looking for a toy for her little boy.
      He had to explain her this was a serious gaming store, he didn't sell toys!
      He managed to sell her a box of Settlers of Catan.
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_THE_DUDE.key],
    location: "The Goblin's Den",
  },
  {
    summary: `
      The Dude participated in his first Hordes tournament.
      He was very hopeful but he didn't do very well, though he stil lrefuses to admit it and blames luck.
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_THE_DUDE.key],
    location: "The Goblin's Den",
  },
];
