import { ActivityType } from '@/lib/_model/enums-sim';

export const CHARACTER_EMMA = {
  key: 'emma',
  name: 'Emma',
  place: 0,
  cash: 80,
  bio: `Emma is a 27 years old successful lawyer.
  She is smart, witty, competitive, but also playful and funny.
  She is very attractive and knows how to use it.
  She had to chose her law career for economic reasons but dreamt to be a writer.
  Her favorite Hordes cards are black and blue, especially Italia cards.`,
};

export const CHARACTER_EMMA_MEMORIES = [
  {
    summary: `
      Emma remembers sketching for hours as a little girl.
      She would sit by the window of her family's small apartment,
      drawing people she saw on the street below.
      She always dreamt of becoming an artist.   
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_EMMA.key],
    location: 'Childhood Apartment',
  },
  {
    summary: `
      Emma remembers her father working late shifts and her mother
      patching clothes to save money. 
      She felt the weight of her family's struggles early on, 
      and promised herself she would one day provide for them. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_EMMA.key],
    location: 'Childhood Home',
  },
  {
    summary: `
      Emma recalls winning a school art contest at age twelve.
      For a brief moment she felt like her dream of becoming an artist was possible,
      but she knew deep down that her family needed her to choose a safer path. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_EMMA.key],
    location: 'Middle School',
  },
  {
    summary: `
      Emma remembers studying at the public library every evening in high school.
      While her friends went out, she stayed behind to work,
      determined to earn a scholarship that could secure her future. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_EMMA.key],
    location: 'Public Library',
  },
  {
    summary: `
      Emma recalls her first day of law school.
      She felt proud and out of place at the same time,
      carrying with her the memory of the sacrifices her parents made 
      and the dreams she had set aside. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_EMMA.key],
    location: 'Law School',
  },
];
