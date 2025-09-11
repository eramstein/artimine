import { gs } from '@/lib/_state/main.svelte';
import { ActionType } from '../_model/enums-sim';
import { ACTIONS } from '../sim/actions-map';
import type { Tool } from './llm-service';

const goTo: () => Tool = () => {
  return {
    type: 'function',
    function: {
      name: ActionType.GoTo,
      description: ACTIONS[ActionType.GoTo].description,
      parameters: {
        type: 'object',
        required: ['people', 'destinationZone'],
        properties: {
          destinationZone: {
            type: 'string',
            description: 'The zone within the place where the person is going to',
            enum: gs.places.map((p) => p.name),
          },
          people: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'The people going to the destination zone',
            enum: Object.values(gs.characters).map((c) => c.name),
          },
        },
      },
    },
  };
};

const startGame: () => Tool = () => {
  return {
    type: 'function',
    function: {
      name: ActionType.StartGame,
      description: ACTIONS[ActionType.StartGame].description,
      parameters: {
        type: 'object',
        required: ['opponent'],
        properties: {
          opponent: {
            type: 'string',
            description:
              'The other player in the game, one of the characters present at the same place',
            enum: Object.values(gs.characters).map((c) => c.name),
          },
        },
      },
    },
  };
};

const startTrade: () => Tool = () => {
  return {
    type: 'function',
    function: {
      name: ActionType.StartTrade,
      description: ACTIONS[ActionType.StartTrade].description,
      parameters: {
        type: 'object',
        required: ['partner'],
        properties: {
          partner: {
            type: 'string',
            description:
              'The person tarding cards with you, one of the characters present at the same place',
            enum: Object.values(gs.characters).map((c) => c.name),
          },
        },
      },
    },
  };
};

export function getTools(): Tool[] {
  return [goTo, startGame, startTrade].map((f) => f());
}
