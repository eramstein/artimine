import { gs } from '@/lib/_state/main.svelte';
import { ActionType, ActivityType, DayPeriod, Difficulty } from '../_model/enums-sim';
import { ACTIONS } from '../sim/actions-map';
import { dayNames } from '../sim/schedule';
import type { Tool } from './llm-service';

const generalChallenge: () => Tool = () => {
  return {
    type: 'function',
    function: {
      name: ActionType.GeneralChallenge,
      description: ACTIONS[ActionType.GeneralChallenge].description,
      parameters: {
        type: 'object',
        required: ['attribute', 'challengeDescription', 'difficulty'],
        properties: {
          attribute: {
            type: 'string',
            description: 'The attribute to check',
            enum: ['intelligence', 'charisma', 'vitality', 'dexterity'],
          },
          challengeDescription: {
            type: 'string',
            description: 'The description of the challenge',
          },
          difficulty: {
            type: 'string',
            description: 'The difficulty of the challenge',
            enum: Object.values(Difficulty),
          },
        },
      },
    },
  };
};

const goTo: () => Tool = () => {
  return {
    type: 'function',
    function: {
      name: ActionType.GoTo,
      description: ACTIONS[ActionType.GoTo].description,
      parameters: {
        type: 'object',
        required: ['people', 'destination'],
        properties: {
          destination: {
            type: 'string',
            description: 'The place where the people are going to',
            enum: gs.places.map((p) => p.name),
          },
          people: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'The people going to the destination',
            enum: gs.chat?.characters.map((c) => c.name),
          },
        },
      },
    },
  };
};

const improveRelationship: () => Tool = () => {
  return {
    type: 'function',
    function: {
      name: ActionType.ImproveRelationship,
      description: ACTIONS[ActionType.ImproveRelationship].description,
      parameters: {
        type: 'object',
        required: ['people', 'relationType', 'difficulty'],
        properties: {
          relationType: {
            type: 'string',
            description: 'The type of relationship to improve',
            enum: ['friendship', 'love', 'respect'],
          },
          people: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'The people to improve the relationship with',
            enum: gs.chat?.characters.map((c) => c.name),
          },
          difficulty: {
            type: 'string',
            description: 'How difficult it is to improve the relationship with that approach',
            enum: Object.values(Difficulty),
          },
        },
      },
    },
  };
};

const scheduleActivity: () => Tool = () => {
  return {
    type: 'function',
    function: {
      name: ActionType.ScheduleActivity,
      description: ACTIONS[ActionType.ScheduleActivity].description,
      parameters: {
        type: 'object',
        required: ['people', 'destination', 'activityType', 'time'],
        properties: {
          destination: {
            type: 'string',
            description: 'The place where the person is going to',
            enum: gs.places.map((p) => p.name),
          },
          activityType: {
            type: 'string',
            description: 'The type of activity to schedule',
            enum: Object.values(ActivityType),
          },
          time: {
            type: 'string',
            description: 'The time of the day the activity is scheduled',
            enum: Object.values(DayPeriod),
          },
          day: {
            type: 'string',
            description: 'The day the activity is scheduled',
            enum: Object.values(dayNames),
          },
          people: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'The people participating to the activity',
            enum: gs.chat?.characters.map((c) => c.name),
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
            enum: gs.chat?.characters.map((c) => c.name),
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
            enum: gs.chat?.characters.map((c) => c.name) || [],
          },
        },
      },
    },
  };
};

export function getTools(): Tool[] {
  return [goTo, startGame, startTrade, scheduleActivity, generalChallenge, improveRelationship].map(
    (f) => f()
  );
}
