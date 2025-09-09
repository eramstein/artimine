import type { Character } from '../_model';
import { gs } from '../_state';
import { uiState } from '../_state/state-ui.svelte';
import { getGroupDescription } from './chat-helpers';
import { playerChatSystemPrompt, summarySystemPrompt } from './chat-system-prompts';
import { llmService } from './llm-service';

async function generateSummary(transcript: string): Promise<string> {
  const systemPrompt = {
    role: 'system',
    content: summarySystemPrompt,
  };

  const userPrompt = {
    role: 'user',
    content: `Transcript: ${transcript}`,
  };

  const response = await llmService.chat({
    messages: [systemPrompt, userPrompt],
    responseFormat: { type: 'json_object' },
  });

  const formattedResponse = llmService.getMessage(response);
  const parsed = JSON.parse(formattedResponse);

  return parsed;
}

export async function playerSendChat(message: string): Promise<string> {
  if (!gs.chat) {
    return '';
  }
  if (message === 'end') {
    endPlayerChat();
    return '';
  }
  const playerName = gs.player.name;
  const place = gs.places[gs.player.place];
  const timeOfDay = gs.time.period;
  const context = gs.activity.activityType;
  const locationDescription = place.name + ', ' + place.description || '';
  const charactersDescription = getGroupDescription(gs.chat.characters);
  const currentSummary = gs.chat.summary
    ? 'Previous Conversation Summary:\n' + gs.chat.summary
    : '';

  const systemPrompt = {
    role: 'system',
    content: `${playerChatSystemPrompt.intro}

    Player Character:
      - The player controls ${playerName}.
      - Do not write any dialogue, actions, body language, thoughts, or emotions for ${playerName}.
      - The player will describe ${playerName}'s dialogue and actions.

    NPC Control:
    - You control all other characters (NPCs).
    - Only write dialogue, actions, thoughts, emotions, and reactions for the NPCs.
    - NPCs should respond naturally and believably to ${playerName} actions and words.

    Narrative Style:
    - Use immersive third-person narration for the NPCs you control.
    - Include their body language, tone of voice, emotions, and internal thoughts.
    - Do not include any narrative prose describing ${playerName}.
    - If NPCs react to ${playerName} actions or emotions, describe their perception or interpretation (e.g., "Lise noticed the tension in ${gs.player.name}'s voice."), but do not narrate ${gs.player.name}'s state directly.

    Scene Context:
      - Location: ${locationDescription}
      - Time of Day: ${timeOfDay}
      - Current Activity: ${context}

    Characters:
    ${charactersDescription}

    ${currentSummary}

    ${playerChatSystemPrompt.instruction}
    
    Example Output Style (NPC-only):
    Lise's eyes darted nervously toward ${playerName}. She took a shaky breath, her voice trembling.
    "I... I really hope I'm not imposing," she whispered, twisting her fingers anxiously.

    She glanced down at the tiled floor, her cheeks flushed with embarrassment, awaiting ${playerName}'s response.
    `,
  };
  console.log('systemPrompt', systemPrompt);

  // reset initial system prompt
  gs.chat.history[0] = systemPrompt;

  const userPrompt = {
    role: 'user',
    content: playerName + ' says and does this: ' + message,
    displayLabel: message,
  };

  gs.chat.history.push(userPrompt);

  // Start streaming
  uiState.chat.isStreaming = true;
  uiState.chat.streamingContent = '';

  const stream = await llmService.chat({
    messages: gs.chat.history.slice(-6),
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

  // every 10 messages, update the previous summary
  const SUMMARY_INTERVAL = 10;

  if ((gs.chat.history.length - 1) % SUMMARY_INTERVAL <= 1) {
    const currentSummary = gs.chat.summary;
    const messagesToSummarize = gs.chat.history
      .filter((m) => m.role !== 'system')
      .slice(2 - SUMMARY_INTERVAL)
      .map((m) => m.content || '')
      .join(' \n');
    const summayPrompt = currentSummary
      ? 'Summary of previous events: ' + currentSummary + '\n\n New events:' + messagesToSummarize
      : messagesToSummarize;
    gs.chat.summary = await generateSummary(summayPrompt);
    gs.chat.lastSummaryMessageIndex = gs.chat.history.length - 1;
  }
  return transcript;
}

export function initPlayerChat(characters: Character[]) {
  gs.chat = {
    characters,
    history: [],
    summary: '',
    lastSummaryMessageIndex: 0,
  };
}

export async function endPlayerChat() {
  // complete the summary with last messages
  const currentSummary = gs.chat!.summary;
  const messagesToSummarize = gs
    .chat!.history.filter((m) => m.role !== 'system')
    .slice(gs.chat!.lastSummaryMessageIndex + 1)
    .map((m) => m.content || '')
    .join(' \n');
  const summayPrompt = currentSummary
    ? 'Summary of previous events: ' + currentSummary + '\n\n New events:' + messagesToSummarize
    : messagesToSummarize;
  const summary = await generateSummary(summayPrompt);
  console.log('summary', summary);
  // TODO: store memories
  gs.chat = null;
}
