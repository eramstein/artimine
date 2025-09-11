import { ActionType } from '@/lib/_model/enums-sim';
import type { ActionTypeDefinition } from '@/lib/_model/model-game';
import { gs } from '../_state/main.svelte';
import { initTrade, startGame } from '../_state/state-ui.svelte';
import { recordActionInChat } from '../llm/action';
import { moveCharacters } from './move';

export const ACTIONS: Record<string, ActionTypeDefinition> = {
  [ActionType.GoTo]: {
    onSuccess: ({ people, destinationZone }: { people: string[]; destinationZone: string }) => {
      const peopleNpcs = people
        .map((person) => Object.values(gs.characters).find((c) => c.name === person))
        .filter((p) => p !== undefined);
      moveCharacters(peopleNpcs, destinationZone);
      recordActionInChat(
        `${gs.player.name} and ${people.join(', ')} went to ${destinationZone}`,
        true
      );
    },
    checkSuccess: ({ people, destinationZone }) => ({
      success: true,
      description: `${people.join(', ')} agreed to go to ${destinationZone}`,
    }),
    description: 'Propose to go somewhere',
    getLabel: ({ destinationZone }: { people: string[]; destinationZone: string }) => {
      return `Go to ${destinationZone}`;
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
