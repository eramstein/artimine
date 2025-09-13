import { ActionType } from '@/lib/_model/enums-sim';
import type { ActionTypeDefinition } from '@/lib/_model/model-game';
import { gs } from '../_state/main.svelte';
import { initTrade, startGame } from '../_state/state-ui.svelte';
import { recordActionInChat } from '../llm/action';
import { generalChallengeAction, scheduleActivityAction } from './actions/index';
import { moveCharacters } from './move';

export const ACTIONS: Record<string, ActionTypeDefinition> = {
  [ActionType.ScheduleActivity]: scheduleActivityAction,
  [ActionType.GeneralChallenge]: generalChallengeAction,
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
      isCritical: false,
      descriptionSuccess: `${people.join(', ')} agreed to go to ${destination}`,
      descriptionFailure: `${people.join(', ')} did not agree to go to ${destination}`,
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
      isCritical: false,
      descriptionSuccess: `${opponent} agreed to play`,
      descriptionFailure: `${opponent} did not agree to play`,
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
      isCritical: false,
      descriptionSuccess: `${partner} agreed to trade`,
      descriptionFailure: `${partner} did not agree to trade`,
    }),
    description: 'Propose to trade cards with a character.',
    getLabel: () => {
      return `Trade cards`;
    },
  },
  [ActionType.None]: {
    checkSuccess: () => ({
      success: true,
      isCritical: false,
      descriptionSuccess: 'Congrats, you did nothing!',
      descriptionFailure: 'You did nothing!',
    }),
    description: 'Do nothing',
    getLabel: () => {
      return `Do nothing`;
    },
  },
};
