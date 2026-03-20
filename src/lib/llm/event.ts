import { type Event, type EventOption, type Npc } from '../_model';
import { gs } from '../_state/main.svelte';
import { generateUniqueId } from '../_utils/random';
import { getParticipants } from '../sim/activity';
import { generateSummary } from './chat';
import { getGroupDescription } from './chat-helpers';
import { LLM_API_TOOL_MODEL } from './config';
import { llmService } from './llm-service';
import { getSystemPromptMemories } from './memories';
import { saveActivityLog } from './memories-db';

/**
 * Generates a narrative event using an LLM, based on the current game state and context.
 * The event is designed to evolve character arcs and provide challenges and rewards.
 * "plot" gives some narrative constraints: what the NPC(s) try to accomplish
 */
export async function generateEventWithLLM(
  plot: string = '',
  options: EventOption[] = [],
  characters: Npc[] = []
): Promise<Event> {
  // context
  const place = gs.places[gs.player.place];
  const timeOfDay = gs.time.period;
  const context = gs.activity.activityType;
  const locationDescription = place.name + ', ' + place.description || '';
  const charactersDescription = getGroupDescription(characters);

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

Your goal is to generate a short, contextual, meaningful event that progresses character arcs and provides challenges.

The [PLOT] constraints describe what an NPC is trying to accomplish or which direction the narrative should take.

RULES

- Avoid bland, generic situations
- If the player is referenced, it is "you" and not "${gs.player.name}"
- Description is about what the NPCs do, options are about how the player reacts

RULES (STRICT):

- The event MUST progress the narrative arc described in [PLOT].
- NEVER control or describe the player character's decisions or actions.
  The player character may only:
  - react passively
  - speak briefly if necessary
  - but must NOT initiate major actions or decisions
- The event must present a situation TO the player, not resolve it.

OPTIONS:
- Generate one choice for each element in the given [OPTIONS].
- Each choice is the description of how the player would react to the situation.

OUTPUT (STRICT JSON):
{
  "title": "string",
  "description": "string",
  "options": ["string"]
}
    `,
  };

  const optionsPrompt = makeOptionPrompt(options);
  const userPrompt = {
    role: 'user',
    content: `
      [PLOT]
      ${plot}

      [OPTIONS]
      ${optionsPrompt}

      [PLAYER]
      ${gs.player.name}
      ${gs.player.bio}
    
      [SCENE]
      - Activity: ${context}
      - Location: ${locationDescription}
      - Time: ${timeOfDay}
      - Present NPCs: ${characters.map((c) => c.name).join(', ')}

      [NPCs]
      ${charactersDescription}      

      ${memoriesPrompt ? `[MEMORIES]\n${memoriesPrompt}` : ''}
    `,
  };

  console.log(systemPrompt.content, userPrompt.content);

  try {
    const m = await llmService.chat({
      model: LLM_API_TOOL_MODEL,
      stream: false,
      responseFormat: { type: 'json_object' },
      messages: [systemPrompt, userPrompt],
    });

    const event = llmService.getMessage(m);
    const formattedEvent = JSON.parse(event);
    console.log('new event', formattedEvent);
    formattedEvent.options = formattedEvent.options.map((o: string) => ({ description: o }));
    return formattedEvent as Event;
  } catch (e) {
    console.error('Error generating event', e);
    throw e;
  }
}

export async function resolveEventWithLLM(
  optionDescription: string,
  isSuccess: boolean,
  isCritical: boolean
): Promise<string> {
  const place = gs.places[gs.player.place];
  const timeOfDay = gs.time.period;
  const context = gs.activity.activityType;
  const locationDescription = place.name + ', ' + place.description || '';
  const characters = getParticipants(gs.activity);
  const charactersDescription = getGroupDescription(characters);
  const event = gs.activity.event;
  const eventDescription = [event!.description, ...event!.history].join('`n');

  const systemPrompt = {
    role: 'system',
    content: `
    You are a narrative simulator for a character-driven RPG.

An event occurred. The player chose an action. The outcome is known.

Your task:
1. Describe what happens next in a short, vivid scene.
2. Update how each NPC's perception of the player evolves.

---

RULES:

- The scene MUST be a direct consequence of the player’s action.
- Reflect success/failure clearly in the outcome.
- NPC reactions must be consistent with:
  - their personality
  - their relationship with the player

- Avoid generic success/failure descriptions.

OUTPUT: plain text, describing the scene as the player would see it.

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

  try {
    const m = await llmService.chat({
      model: LLM_API_TOOL_MODEL,
      stream: false,
      messages: [systemPrompt, userPrompt],
    });

    const outcome = llmService.getMessage(m);
    // save memory in DB
    const summary = await generateSummary(eventDescription + '. ' + outcome);
    saveActivityLog({
      id: generateUniqueId(),
      day: gs.time.day,
      participants: characters.map((c) => c.key),
      location: gs.places[gs.player.place].name,
      activityType: gs.activity.activityType,
      summary,
      embedding: [],
    });
    return outcome;
  } catch (e) {
    console.error('Error generating event', e);
    throw e;
  }
}

function makeOptionPrompt(options: EventOption[]): string {
  let output = '';
  for (const option of options) {
    if (!option.stopPoint) {
      output += `  - Theme: ${option.description}. This option should progress the plot and leave room for continuation.\n`;
    } else {
      output += ` - The player tries something ${option.difficulty}. That actions requires ${option.relatedAttribute} (do not mention this explicitely). If successful, it would increase ${Object.keys(option.onSuccess?.relation || {}).join(', ')} with the NPC. This option should bring closure to the event.\n`;
    }
  }
  return output;
}
