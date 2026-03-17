import { Difficulty } from '../_model';
import { gs } from '../_state/main.svelte';
import { generateUniqueId, getRandomFromArray } from '../_utils/random';
import { getParticipants } from '../sim/activity';
import { updateNpcRelationValue } from '../sim/relation';
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

// these are global to be shared across event generation and event resolution
let eventType = '';
let relationshipGoal = '';
let twist = '';
let hiddenIntention = '';
let narrativePressure = '';

export async function generateEventWithLLM() {
  // context
  const place = gs.places[gs.player.place];
  const timeOfDay = gs.time.period;
  const context = gs.activity.activityType;
  const locationDescription = place.name + ', ' + place.description || '';
  const characters = getParticipants(gs.activity);
  const charactersDescription = getGroupDescription(characters);

  // constraints to help the LLM be less generic
  eventType = getRandomFromArray(eventTypes);
  relationshipGoal = getRandomFromArray(relationshipGoals);
  twist = Math.random() > 0.5 ? getRandomFromArray(twistTypes) : null;
  hiddenIntention = Math.random() > 0.5 ? getRandomFromArray(hiddenIntentions) : null;
  narrativePressure = getRandomFromArray(narrativePressures);

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
event_type: ${eventType}
relationship_goal: ${relationshipGoal}
twist: ${twist}
hidden_intention: ${hiddenIntention}
narrative_pressure: ${narrativePressure}
[/NARRATIVE_CONSTRAINTS]

RULES:
- The event MUST reflect event_type and support relationship_goal.
- The twist MUST be clearly present.
- The NPC's hidden_intention must subtly influence behavior.
- Match intensity to narrative_pressure (low/medium/high).
- Use specific context (personality, memories, relationship, location).
- Avoid generic or overused situations.

HARD RULES (STRICT):

- NEVER mention or expose system concepts such as:
  event_type, relationship_goal, twist, hidden_intention, narrative_pressure.
- hidden_intention is internal only. It must influence behavior indirectly, never be stated.
- NEVER control or describe the player character's decisions or actions.
  The player character may only:
  - react passively
  - speak briefly if necessary
  - but must NOT initiate major actions or decisions
- The event must present a situation TO the player, not resolve it.
- If the player character performs a strong action (accuse, confess, decide),
  the output is INVALID.

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
  const characters = getParticipants(gs.activity);
  const charactersDescription = getGroupDescription(characters);
  const eventDescription = gs.activity.event?.description || '';

  const systemPrompt = {
    role: 'system',
    content: `
    You are a narrative simulator for a character-driven RPG.

An event occurred. The player chose an action. The outcome is known.

Your task:
1. Describe what happens next in a short, vivid scene.
2. Update how each NPC's perception of the player evolves.

---

[NARRATIVE CONTEXT]
event_type = ${eventType}
relationship_goal = ${relationshipGoal}
hidden_intention = ${hiddenIntention}
narrative_pressure = ${narrativePressure}
[/NARRATIVE CONTEXT]

---

RULES:

- The scene MUST be a direct consequence of the player’s action.
- Reflect success/failure clearly in the outcome.
- NPC reactions must be consistent with:
  - their personality
  - their relationship with the player
  - their hidden intention

- Avoid generic success/failure descriptions.

---

RELATIONSHIP EVOLUTION:

For each NPC, update:
- respect
- friendship
- love

Values:
-2 (big decrease), -1 (small decrease), 0 (no change), 1 (small increase), 2 (big increase)

Guidelines:
- Changes must be justified by the scene.
- Do NOT change all values at once unless strongly justified.
- Failure can still increase some values (e.g. vulnerability → friendship).
- Success can backfire depending on personality.

---

OUTPUT (STRICT JSON):

{
  "description": "string",
  "relationValuesByCharacter": {
    "characterName": {
      "respect": number,
      "friendship": number,
      "love": number
    }
  }
}

---

[PLAYER CHARACTER]
  - **${gs.player.name}** ${gs.player.bio}

[CONTEXT]
  - **Location:** ${locationDescription}
  - **Time:** ${timeOfDay}
  - **Activity:** ${context}
  - **Recent Event:** ${eventDescription}

[NPCs]
${charactersDescription}
    `,
  };

  const userPrompt = {
    role: 'user',
    content: `
      [ACTION]
      player_action = ${optionDescription}
      outcome = ${isSuccess ? 'success' : 'failure'}
      critical = ${isCritical ? 'yes' : 'no'}
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
            updateNpcRelationValue(char, 'respect', charChanges.respect);
          }
          if (charChanges.friendship) {
            updateNpcRelationValue(char, 'friendship', charChanges.friendship);
          }
          if (charChanges.love) {
            updateNpcRelationValue(char, 'love', charChanges.love);
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
