import { ActivityType } from '@/lib/_model/enums-sim';

export const CHARACTER_OUSMANE = {
  key: 'ousmane',
  name: 'Ousmane',
  place: 0,
  cash: 100,
  bio: `Ousmane is a 29 years old former athlete.
  He is charismatic, funny, resilient and a bit nostalgic.
  He used ot be a professional footballer but got injured. He now dreams to become a pro card player.
  His favorite Hordes cards are red and black, especially Reik cards.`,
};

export const CHARACTER_OUSMANE_MEMORIES = [
  {
    summary: `
      Ousmane remembers playing football in the streets with his friends as a kid.
      They used bottles or stones for goalposts, and he always played barefoot.
      Those games made him fall in love with the sport.   
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_OUSMANE.key],
    location: 'Neighborhood Street',
  },
  {
    summary: `
      Ousmane recalls his first professional match.
      He was nervous, but the roar of the crowd gave him energy,
      and he felt like nothing in the world could stop him. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_OUSMANE.key],
    location: 'Football Stadium',
  },
  {
    summary: `
      Ousmane remembers the injury that ended his career.
      One moment he was sprinting across the field, the next he was on the ground,
      knowing deep down that things would never be the same. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_OUSMANE.key],
    location: 'Football Pitch',
  },
  {
    summary: `
      Ousmane recalls teaching kids how to play after his recovery.
      He tried to hide his frustration, joking with them instead,
      but inside he felt both proud and painfully nostalgic. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_OUSMANE.key],
    location: 'Local Training Ground',
  },
  {
    summary: `
      Ousmane remembers the night he discovered competitive card games.
      He was hooked immediately, telling his friends with a laugh
      that if he couldn’t be a football star anymore, he’d become a champion with cards. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_OUSMANE.key],
    location: 'Card Club',
  },
];
