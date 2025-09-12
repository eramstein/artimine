import { ActionType, ActivityType, DayPeriod } from '@/lib/_model/enums-sim';
import type { ActionTypeDefinition } from '@/lib/_model/model-game';
import { gs } from '../_state/main.svelte';
import { initTrade, startGame } from '../_state/state-ui.svelte';
import { recordActionInChat } from '../llm/action';
import { moveCharacters } from './move';
import { scheduleActivity } from './schedule';
import { getDayNumberFromWeekday } from './time';

export const ACTIONS: Record<string, ActionTypeDefinition> = {
  [ActionType.ScheduleActivity]: {
    onSuccess: ({
      people,
      destination,
      activityType,
      day,
      time,
    }: {
      people: string[];
      destination: string;
      activityType: string;
      day: string;
      time: DayPeriod;
    }) => {
      console.log('ScheduleActivity', { people, destination, activityType, time });
      const peopleNpcs = people
        .map((person) => Object.values(gs.characters).find((c) => c.name === person))
        .filter((p) => p !== undefined);
      const activityTypeEnum = ActivityType[activityType as keyof typeof ActivityType];
      const dayNumber = getDayNumberFromWeekday(day);
      const dayPeriod = time ?? DayPeriod.Afternoon;
      const place = gs.places.find((p) => p.name === destination);
      if (!place) {
        console.log('Destination not found');
        return;
      }
      scheduleActivity(
        { activityType: activityTypeEnum, participants: peopleNpcs.map((p) => p.key) },
        dayNumber,
        dayPeriod,
        place
      );
      recordActionInChat(
        `${gs.player.name} and ${people.join(', ')} will ${activityType} at ${destination} at ${time ?? DayPeriod.Afternoon}`
      );
    },
    checkSuccess: ({ people, destination, activityType, time }) => ({
      success: true,
      description: `${people.join(', ')} agreed to ${activityType} at ${destination} at ${time ?? DayPeriod.Afternoon}`,
    }),
    description: 'Schedule an activity together',
    getLabel: ({
      destination,
      activityType,
      time,
    }: {
      destination: string;
      activityType: string;
      time: string;
    }) => {
      return `${activityType} at ${destination} at ${time}`;
    },
  },
  [ActionType.GoTo]: {
    onSuccess: ({ people, destination }: { people: string[]; destination: string }) => {
      const peopleNpcs = people
        .map((person) => Object.values(gs.characters).find((c) => c.name === person))
        .filter((p) => p !== undefined);
      moveCharacters(peopleNpcs, destination);
      recordActionInChat(`${gs.player.name} and ${people.join(', ')} went to ${destination}`, true);
    },
    checkSuccess: ({ people, destination }) => ({
      success: true,
      description: `${people.join(', ')} agreed to go to ${destination}`,
    }),
    description: 'Propose to go somewhere',
    getLabel: ({ destination }: { people: string[]; destination: string }) => {
      return `Go to ${destination}`;
    },
  },
  [ActionType.StartGame]: {
    onSuccess: ({ opponent }: { opponent: string }) => {
      const opponentNpc = Object.values(gs.characters).find((c) => c.name === opponent);
      if (opponentNpc) {
        startGame(opponentNpc);
      }
    },
    checkSuccess: ({ opponent }: { opponent: string }) => ({
      success: true,
      description: `${opponent} agreed to play`,
    }),
    description: 'Propose to start a game of Hordes cards.',
    getLabel: () => {
      return `Start a game`;
    },
  },
  [ActionType.StartTrade]: {
    onSuccess: ({ partner }: { partner: string }) => {
      const partnerNpc = Object.values(gs.characters).find((c) => c.name === partner);
      if (partnerNpc) {
        initTrade(partnerNpc);
      }
    },
    checkSuccess: ({ partner }: { partner: string }) => ({
      success: true,
      description: `${partner} agreed to trade`,
    }),
    description: 'Propose to trade cards with a character.',
    getLabel: () => {
      return `Trade cards`;
    },
  },
  [ActionType.None]: {
    onSuccess: () => {},
    checkSuccess: () => ({ success: true, description: 'Congrats, you did nothing!' }),
    description: 'Do nothing',
    getLabel: () => {
      return `Do nothing`;
    },
  },
};
