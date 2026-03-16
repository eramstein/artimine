import { config } from '../_config';
import { gs } from '../_state/main.svelte';
import { clamp } from '../_utils/random';
import { getGroupDescription } from './chat-helpers';
import { LLM_API_TOOL_MODEL } from './config';
import { llmService } from './llm-service';
import { getSystemPromptMemories } from './memories';

export async function generateEventWithLLM() {
  const place = gs.places[gs.player.place];
  const timeOfDay = gs.time.period;
  const context = gs.activity.activityType;
  const locationDescription = place.name + ', ' + place.description || '';
  const characters = gs.activity.participants.map((key) => gs.characters[key]);
  const charactersDescription = getGroupDescription(characters);

  // get last memory involving at least one of these characters
  const relevantMemories = await getSystemPromptMemories(
    gs.time.day,
    characters,
    gs.places[gs.player.place],
    gs.activity.activityType,
    'memorable, important, funny'
  );
  const memoriesPrompt = relevantMemories || '';

  const systemPrompt = {
    role: 'system',
    content: `
    ### Instructions
    You are a dungeon master for a collaborative narrative RPG.
    Generate an event description that occurs during the current scene.
    It should be interesting, so either funny, surprising, or dramatic.
    It can be important (an accident, a romantic move) or trivial (like a character proposing to play a board game).
    Important: try to make it context specific to avoid making it generic. See the ### NPCs section below to see the other characters opinion of the players and important memories.
    Keep it around 2 or 3 short paragraphs.
    Add an event title that is summarizing it in a few words.

    Along with the event, generate 3 possible actions the player can take in reaction to that event.
    Each option includes a relevant player attribute and a diffulty score to get a positive outcome if that option is chosen.
    For example, if the option is "perform a backflip", the attribute is "dexterity" and the difficulty is 8/10. 

    ### Possible attributes: ${Object.keys(gs.player.attributes).join(', ')}

    ### Output Format:
    {
      "title": "string",
      "description": "string",
      "options": [{
        "description": "string",
        "attribute": "string",
        "difficulty": "number"
      }]
    }

    ### Player Character
      - **${gs.player.name}** ${gs.player.bio}
    
    ### Context
      - **Location:** ${locationDescription}
      - **Time:** ${timeOfDay}
      - **Activity:** ${context}

    ### NPCs
    ${charactersDescription}

    ${memoriesPrompt ? `### Relevant Memories\n${memoriesPrompt}` : ''}    
    `,
  };

  console.log(systemPrompt.content);

  llmService
    .chat({
      model: LLM_API_TOOL_MODEL,
      stream: false,
      responseFormat: { type: 'json_object' },
      messages: [systemPrompt],
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
    .then((m) => {
      const outcome = llmService.getMessage(m);
      const formattedOutcome = JSON.parse(outcome);
      gs.activity.event!.outcome = formattedOutcome;

      // Update character relationship values
      if (formattedOutcome.relationValuesByCharacter) {
        for (const [charName, changes] of Object.entries(formattedOutcome.relationValuesByCharacter)) {
          const npcKey = Object.keys(gs.characters).find(
            (key) => gs.characters[key].name === charName
          );

          if (npcKey) {
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
          }
        }
      }
    })
    .catch((e) => {
      console.error('Error generating event', e);
    });
}
