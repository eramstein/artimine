import { gs } from '../_state/main.svelte';
import { uiState } from '../_state/state-ui.svelte';
import { generateUniqueId } from '../_utils/random';
import { getGroupDescription } from './chat-helpers';
import { llmService } from './llm-service';
import { getSystemPromptMemories } from './memories';
import { saveActivityLog } from './memories-db';

export async function writeSceneDescription(message: string): Promise<string> {
  if (!gs.chat) {
    return '';
  }

  const place = gs.places[gs.player.place];
  const timeOfDay = gs.time.period;
  const context = gs.activity.activityType;
  const actionOutcomes = gs.chat.attemptedActionsResults || '';
  const locationDescription = place.name + ', ' + place.description || '';
  const charactersDescription = getGroupDescription(gs.chat.characters);

  // get last memory involving at least one of these characters
  const relevantMemories = await getSystemPromptMemories(
    gs.time.day,
    gs.chat.characters,
    gs.places[gs.player.place],
    gs.activity.activityType,
    message
  );
  const memoriesPrompt = relevantMemories || '';

  const systemPrompt = {
    role: 'system',
    content: `
    ### Instructions
    You are a dungeon master for a collaborative narrative RPG.
    You are given a description of what the player's character attempted to do, as well as the outcome.
    Write a description of what happened in the scene, including details about how the player's character behaved, and the present NPCs dialogues and actions.

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
  console.log('systemPrompt', systemPrompt.content);

  // reset initial system prompt
  gs.chat.history[0] = systemPrompt;

  const userPrompt = {
    role: 'user',
    content: `
    ### What the players says his character does:
      - ${message}

    ### How it went:
      - ${actionOutcomes}
    `,
    displayLabel: message,
  };

  console.log('userPrompt', userPrompt.content);

  gs.chat.history.push(userPrompt);
  gs.chat.attemptedActionsResults = '';

  // Start streaming
  uiState.chat.isStreaming = true;
  uiState.chat.streamingContent = '';

  const stream = await llmService.chat({
    messages: [systemPrompt, userPrompt],
    stream: true,
    options: {
      temperature: 0.7,
      repeat_penalty: 1.1,
      top_k: 40,
      top_p: 0.9,
      max_tokens: 1000,
    },
  });

  let transcript = '';
  for await (const chunk of stream) {
    const convertedChunk = llmService.getStreamChunk(chunk);
    transcript += convertedChunk;
    uiState.chat.streamingContent = transcript;
  }

  // End streaming
  uiState.chat.isStreaming = false;

  gs.chat.history.push({
    role: 'assistant',
    content: transcript,
  });

  // save memory in DB
  await saveActivityLog({
    id: generateUniqueId(),
    day: gs.time.day,
    participants: gs.chat!.characters.map((c) => String(c.key)),
    location: gs.places[gs.player.place].name,
    activityType: gs.activity.activityType,
    summary: transcript,
    embedding: [],
  });
  gs.chat = null;

  return transcript;
}
