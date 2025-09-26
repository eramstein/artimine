import { ActivityType } from '@/lib/_model/enums-sim';

export const CHARACTER_MOLLY = {
  key: 'molly',
  name: 'Molly',
  place: 0,
  cash: 10,
  bio: `Molly is a 20 years old psychology student.
  She is friendly, warm, curious and a bit shy.
  She works as a waitress.
  Her favorite Hordes cards are red and blue, especially Arabia cards.`,
};

export const CHARACTER_MOLLY_MEMORIES = [
  {
    summary: `
      Molly remembers spending hours as a teenager reading books about the mind.
      She was fascinated by why people feel, dream, and act the way they do.
      That curiosity is what led her to study psychology.   
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_MOLLY.key],
    location: 'Childhood Bedroom',
  },
  {
    summary: `
      Molly recalls her first day at university.
      She felt shy walking into the lecture hall full of strangers,
      but quickly warmed up when another student struck up a conversation with her. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_MOLLY.key],
    location: 'University Lecture Hall',
  },
  {
    summary: `
      Molly remembers her first psychology experiment in class.
      It was a simple test on memory and attention,
      but she was thrilled to see the theories she had read about come alive. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_MOLLY.key],
    location: 'Psychology Lab',
  },
  {
    summary: `
      Molly recalls her first shift as a waitress.
      She dropped a tray of glasses and turned bright red,
      but the customers laughed kindly, and she learned to laugh at herself too. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_MOLLY.key],
    location: 'Café',
  },
  {
    summary: `
      Molly remembers listening to her friends talk about their worries.
      She didn’t say much, but they always told her she was a good listener,
      and she felt quietly proud of that. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_MOLLY.key],
    location: 'Dormitory Common Room',
  },
];
