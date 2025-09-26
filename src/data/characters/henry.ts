import { ActivityType } from '@/lib/_model/enums-sim';

export const CHARACTER_HENRY = {
  key: 'henry',
  name: 'Henry',
  place: 0,
  cash: 20,
  bio: `Henry is a 25 years old history student.
  He is naive, friendly, generous and a loyal friend.
  He works as an assistant teacher.
  His favorite Hordes cards are green and blue, especially Kislev cards.`,
};

export const CHARACTER_HENRY_MEMORIES = [
  {
    summary: `
      Henry remembers spending afternoons in the attic of his grandparents' house,
      reading dusty old history books and imagining himself as a great explorer.
      His fascination with the past began there.   
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_HENRY.key],
    location: "Grandparents' Attic",
  },
  {
    summary: `
      Henry recalls helping a classmate study for exams in high school.
      She was struggling, and he stayed up late walking her through the material.
      That was the first time he realized how much he enjoyed teaching others. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_HENRY.key],
    location: 'High School Library',
  },
  {
    summary: `
      Henry remembers his first university lecture as a student.
      He was nervous but thrilled, scribbling down notes faster than he could think,
      feeling like he had finally found his place. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_HENRY.key],
    location: 'University Lecture Hall',
  },
  {
    summary: `
      Henry recalls the day he was offered work as an assistant teacher.
      He felt honored and nervous, determined to prove himself worthy
      and to support the professor who believed in him. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_HENRY.key],
    location: 'University Office',
  },
  {
    summary: `
      Henry remembers organizing a small study group for his friends.
      They joked more than they studied, but he felt proud of being the one
      who brought everyone together and helped them succeed. 
    `,
    day: 0,
    activityType: ActivityType.OldMemories,
    participants: [CHARACTER_HENRY.key],
    location: 'Dormitory Common Room',
  },
];
