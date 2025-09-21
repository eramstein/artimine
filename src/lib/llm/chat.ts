import type { Npc } from '../_model';
import { gs } from '../_state';
import { uiState } from '../_state/state-ui.svelte';
import { generateUniqueId } from '../_utils/random';
import { getGroupDescription } from './chat-helpers';
import { playerChatSystemPrompt, summarySystemPrompt } from './chat-system-prompts';
import { llmService } from './llm-service';
import { getSystemPromptMemories } from './memories';
import { saveActivityLog, saveRelationshipSummaryUpdate } from './memories-db';
import { updateOpinion } from './opinion';

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
  });

  const formattedResponse = llmService.getMessage(response);
  return formattedResponse;
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
  const actionOutcomes = gs.chat.attemptedActionsResults
    ? `\n\nAction Outcomes: ${gs.chat.attemptedActionsResults}`
    : '';
  const locationDescription = place.name + ', ' + place.description || '';
  const charactersDescription = getGroupDescription(gs.chat.characters);
  const currentSummary = gs.chat.summary
    ? 'Previous Conversation Summary:\n' + gs.chat.summary
    : '';
  const memoriesPrompt = gs.chat.memories
    ? `- Relevant Memory:\nThe characters remember a past event that may influence today's conversation:\n"${gs.chat.memories}"`
    : '';

  const systemPrompt = {
    role: 'system',
    content: `${playerChatSystemPrompt.intro}

    Player Character:
      - The player controls ${gs.player.bio}.
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

    ${memoriesPrompt}

    ${playerChatSystemPrompt.instruction}

    ${actionOutcomes}
    `,
  };
  console.log('systemPrompt', systemPrompt.content);

  // reset initial system prompt
  gs.chat.history[0] = systemPrompt;

  const userPrompt = {
    role: 'user',
    content: playerName + ' says and does this: ' + message,
    displayLabel: message,
  };

  gs.chat.history.push(userPrompt);
  gs.chat.attemptedActionsResults = '';

  // Start streaming
  uiState.chat.isStreaming = true;
  uiState.chat.streamingContent = '';

  const stream = await llmService.chat({
    messages: [gs.chat.history[0], ...gs.chat.history.slice(-6)],
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
  if (gs.chat.history.length > gs.chat.lastSummaryMessageIndex + SUMMARY_INTERVAL) {
    const currentSummary = gs.chat.summary;
    const messagesToSummarize = gs.chat.history
      .filter((m) => m.role !== 'system')
      .slice(gs.chat.lastSummaryMessageIndex + 1, gs.chat.history.length - 1)
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

export async function initPlayerChat(characters: Npc[]) {
  // if the characters are the same, do not end the previous chat
  const currentCharacters = gs.chat?.characters.map((c) => c.key).join();
  const newCharacters = characters.map((c) => c.key).join();
  if (currentCharacters === newCharacters) {
    return;
  } else {
    await endPlayerChat();
  }
  // get last memory involving at least one of these characters
  const relevantMemories = await getSystemPromptMemories(
    gs.time.day,
    characters,
    gs.places[gs.player.place],
    gs.activity.activityType
  );
  gs.chat = {
    characters,
    history: [
      {
        role: 'system',
        content: 'Empty prompt, will be set on first player chat.',
      },
    ],
    summary: '',
    lastSummaryMessageIndex: 0,
    memories: relevantMemories,
    attemptedActionsResults: '',
  };

  // add chat initiation
  characters.forEach((c) => {
    if (c.chatInitiation) {
      gs.chat!.history.push({
        role: 'assistant',
        content: c.chatInitiation,
        displayLabel: c.chatInitiation,
      });
      delete c.chatInitiation;
    }
  });
}

export async function endPlayerChat() {
  const userGeneratedMessages =
    gs.chat?.history.filter((m) => !m.fromEngine && m.role === 'user') || [];
  if (!gs.chat?.history || userGeneratedMessages.length < 2) {
    gs.chat = null;
    return;
  }
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
  // update NPC opinions
  for (const npc of gs.chat!.characters) {
    // save old opinion in DB
    await saveRelationshipSummaryUpdate(npc.key, npc.name, npc.relationSummary, gs.time.day);
    // update opinion
    updateOpinion(npc.key, npc.name, npc.relationSummary, summary);
  }
  // save memory in DB
  await saveActivityLog({
    id: generateUniqueId(),
    day: gs.time.day,
    participants: gs.chat!.characters.map((c) => String(c.key)),
    location: gs.places[gs.player.place].name,
    activityType: gs.activity.activityType,
    summary: summary,
  });
  gs.chat = null;
}
