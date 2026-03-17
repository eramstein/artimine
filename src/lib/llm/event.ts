import { config } from '../_config';
import { Difficulty } from '../_model';
import { gs } from '../_state/main.svelte';
import { clamp, generateUniqueId, getRandomFromArray } from '../_utils/random';
import { generateSummary } from './chat';
import { getGroupDescription } from './chat-helpers';
import { LLM_API_TOOL_MODEL } from './config';
import { llmService } from './llm-service';
import { getSystemPromptMemories } from './memories';
import { saveActivityLog } from './memories-db';

const eventTypes = [
  'Revelation (a secret or unexpected information)',
  'Tension (conflict, disagreement, awkwardness)',
  'Bonding (shared vulnerability or connection)',
  'Test (a challenge that reveals character traits)',
  'External disruption (something unexpected interrupts)',
  'Moral dilemma (player must choose between values)',
  'Status shift (change in power/dominance between characters)',
];

const relationshipGoals = [
  'Increase trust',
  'Create doubt',
  'Build attraction',
  'Trigger rivalry',
  'Reveal vulnerability',
  'Establish dominance',
];

const twistTypes = [
  'Unexpected confession',
  'Social interruption',
  'Emotional shift',
  'Status reversal',
  'Hidden information revealed',
];

const hiddenIntentions = [
  'impress',
  'test',
  'hide embarrassment',
  'seek emotional connection',
  'gain advantage',
  'protect themselves',
];

const narrativePressures = ['low', 'medium', 'high'];

export async function generateEventWithLLM() {
  // context
  const place = gs.places[gs.player.place];
  const timeOfDay = gs.time.period;
  const context = gs.activity.activityType;
  const locationDescription = place.name + ', ' + place.description || '';
  const characters = gs.activity.participants.map((key) => gs.characters[key]);
  const charactersDescription = getGroupDescription(characters);

  // constraints to help the LLM be less generic
  const eventType = getRandomFromArray(eventTypes);
  const relationshipGoal = getRandomFromArray(relationshipGoals);
  const twist = Math.random() > 0.5 ? getRandomFromArray(twistTypes) : null;
  const hiddenIntention = Math.random() > 0.5 ? getRandomFromArray(hiddenIntentions) : null;
  const narrativePressure = getRandomFromArray(narrativePressures);

  const relevantMemories = await getSystemPromptMemories(
    gs.time.day,
    characters,
    gs.places[gs.player.place],
    gs.activity.activityType
  );
  const memoriesPrompt = relevantMemories || '';

  const systemPrompt = {
    role: 'system',
    content: `
You are a narrative designer for a character-driven RPG.

Your goal is to generate a short, meaningful event that can evolve relationships between characters.

[NARRATIVE_CONSTRAINTS]
Event Type: ${eventType}
Relationship Goal: ${relationshipGoal}
Twist: ${twist}
Hidden Intention (NPC): ${hiddenIntention}
Narrative Pressure: ${narrativePressure}
[/NARRATIVE_CONSTRAINTS]

RULES:
- The event MUST reflect event_type and support relationship_goal.
- The twist MUST be clearly present.
- The NPC's hidden_intention must subtly influence behavior.
- Match intensity to narrative_pressure (low/medium/high).
- Use specific context (personality, memories, relationship, location).
- Avoid generic or overused situations.

OPTIONS:
- Generate 3 choices.
- Each choice = different strategy and emotional tone.
- Include: one safe, one balanced, one risky option.

OUTPUT (STRICT JSON):

{
  "title": "string",
  "description": "string",
  "options": [
    {
      "description": "string",
      "attribute": "${Object.keys(gs.player.attributes).join(' | ')}",
      "difficulty": "${Object.keys(Difficulty).join(' | ')}"
    }
  ]
}
    `,
  };

  const userPrompt = {
    role: 'user',
    content: `
      [PLAYER]
      ${gs.player.name}
      ${gs.player.bio}
    
      [SCENE]
      - Activity: ${context}
      - Location: ${locationDescription}
      - Time: ${timeOfDay}        

      [NPCs]
      ${charactersDescription}

      ${memoriesPrompt ? `[MEMORIES]\n${memoriesPrompt}` : ''}   
    `,
  };

  console.log(systemPrompt.content, userPrompt.content);

  llmService
    .chat({
      model: LLM_API_TOOL_MODEL,
      stream: false,
      responseFormat: { type: 'json_object' },
      messages: [systemPrompt, userPrompt],
    })
    .then((m) => {
      const event = llmService.getMessage(m);
      const formattedEvent = JSON.parse(event);
      console.log('new event', formattedEvent);
      gs.activity.event = formattedEvent;
    })
    .catch((e) => {
      console.error('Error generating event', e);
    });
}

export async function resolveEventWithLLM(
  optionDescription: string,
  isSuccess: boolean,
  isCritical: boolean
) {
  const place = gs.places[gs.player.place];
  const timeOfDay = gs.time.period;
  const context = gs.activity.activityType;
  const locationDescription = place.name + ', ' + place.description || '';
  const characters = gs.activity.participants.map((key) => gs.characters[key]);
  const charactersDescription = getGroupDescription(characters);
  const eventDescription = gs.activity.event?.description || '';

  const systemPrompt = {
    role: 'system',
    content: `
    ### Instructions
    You are a dungeon master for a collaborative narrative RPG.
    An event occurred and the player has made a decision.
    For a given outcome of the player action, write a scene describing what happens next.
    Based on that scene, also return how this affected the opinion the other characters have of the player.
    For each character name, return the change in respect, friendship and love.
    1 for small increase, 2 for big increase, 0 for no change, -1 for small decrease, -2 for big decrease
    
    ### Output Format:
    {
      "description": "string",
      "relationValuesByCharacter": {
        "characterName": {
          "respect": "number",
          "friendship": "number",
          "love": "number",
        }
      }
    }

    ### Player Character
      - **${gs.player.name}** ${gs.player.bio}
    
    ### Context
      - **Location:** ${locationDescription}
      - **Time:** ${timeOfDay}
      - **Activity:** ${context}
      - **Recent Event:** ${eventDescription}

    ### NPCs
    ${charactersDescription}
    `,
  };

  const userPrompt = {
    role: 'user',
    content: `
      The player attempted this: ${optionDescription}
      ${isSuccess ? 'The player succeeded ' : 'The player failed '}
      ${isCritical ? 'critically' : ''}
    `,
  };

  console.log(systemPrompt.content, userPrompt.content);

  llmService
    .chat({
      model: LLM_API_TOOL_MODEL,
      stream: false,
      responseFormat: { type: 'json_object' },
      messages: [systemPrompt, userPrompt],
    })
    .then(async (m) => {
      const outcome = llmService.getMessage(m);
      const formattedOutcome = JSON.parse(outcome);
      gs.activity.event!.outcome = formattedOutcome;

      // Update character relationship values
      if (formattedOutcome.relationValuesByCharacter) {
        for (const [charName, changes] of Object.entries(
          formattedOutcome.relationValuesByCharacter
        )) {
          const npcKey = Object.keys(gs.characters).find(
            (key) => gs.characters[key].name === charName
          );

          if (!npcKey) return;
          const char = gs.characters[npcKey];
          const charChanges = changes as any;
          if (charChanges.respect) {
            char.relationValues.respect = clamp(
              char.relationValues.respect + charChanges.respect,
              -config.opinionMaxValue,
              config.opinionMaxValue
            );
          }
          if (charChanges.friendship) {
            char.relationValues.friendship = clamp(
              char.relationValues.friendship + charChanges.friendship,
              -config.opinionMaxValue,
              config.opinionMaxValue
            );
          }
          if (charChanges.love) {
            char.relationValues.love = clamp(
              char.relationValues.love + charChanges.love,
              -config.opinionMaxValue,
              config.opinionMaxValue
            );
          }
          // update NPC daily interactions summary
          char.period.interactionsSummary += '\n' + formattedOutcome.description;
        }
      }
      // save memory in DB
      const summary = await generateSummary(eventDescription + '. ' + formattedOutcome.description);
      await saveActivityLog({
        id: generateUniqueId(),
        day: gs.time.day,
        participants: characters.map((c) => c.key),
        location: gs.places[gs.player.place].name,
        activityType: gs.activity.activityType,
        summary,
        embedding: [],
      });
    })
    .catch((e) => {
      console.error('Error generating event', e);
    });
}
