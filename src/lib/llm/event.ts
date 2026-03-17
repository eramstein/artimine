import { config } from '../_config';
import { Difficulty } from '../_model';
import { gs } from '../_state/main.svelte';
import { clamp, generateUniqueId } from '../_utils/random';
import { getGroupDescription } from './chat-helpers';
import { LLM_API_TOOL_MODEL } from './config';
import { llmService } from './llm-service';
import { getSystemPromptMemories } from './memories';
import { saveActivityLog } from './memories-db';

export async function generateEventWithLLM() {
  const place = gs.places[gs.player.place];
  const timeOfDay = gs.time.period;
  const context = gs.activity.activityType;
  const locationDescription = place.name + ', ' + place.description || '';
  const characters = gs.activity.participants.map((key) => gs.characters[key]);
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
    You are a dungeon master for a collaborative narrative RPG. Your task is to generate an event description that occurs during the current scene. The event should be interesting, context-specific, and avoid being generic.
    
    ### Instructions
    1. Generate an event description that is either funny, surprising, or dramatic.
    2. The event should be context-specific, using details from the provided context about the characters, their relationships, and the location.
    3. Keep the description around 2 or 3 short paragraphs.
    4. Add an event title that summarizes it in a few words.
    5. Along with the event, generate 3 possible actions the player can take in reaction to that event.
    6. Each option includes a relevant player attribute and a difficulty level described in text.

    ### Possible attributes: ${Object.keys(gs.player.attributes).join(', ')}
    ### Possible difficulty levels: ${Object.keys(Difficulty).join(', ')}

    ### Output Format:
    {
      "title": "string",
      "description": "string",
      "options": [{
        "description": "string",
        "attribute": "string",
        "difficulty": "string"
      }]
    }     
    `,
  };

  const userPrompt = {
    role: 'user',
    content: `
      ### Player Character
      - **${gs.player.name}** ${gs.player.bio}
    
      ### Context
        - **Activity:** The characters are ${context}
        - **Location:** ${locationDescription}
        - **Time:** ${timeOfDay}        

      ### NPCs
      ${charactersDescription}

      ${memoriesPrompt ? `### Relevant Memories\n${memoriesPrompt}` : ''}   
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
      await saveActivityLog({
        id: generateUniqueId(),
        day: gs.time.day,
        participants: characters.map((c) => c.key),
        location: gs.places[gs.player.place].name,
        activityType: gs.activity.activityType,
        summary: eventDescription + '. ' + formattedOutcome.description,
        embedding: [],
      });
    })
    .catch((e) => {
      console.error('Error generating event', e);
    });
}
