import { uiState } from '../_state';
import { gs } from '../_state/main.svelte';
import { getGroupDescription } from './chat-helpers';
import { llmService } from './llm-service';

export async function sendTradeEvent(message: string, accepted: boolean): Promise<string> {
  if (!gs.chat) {
    return '';
  }

  const playerName = gs.player.name;
  const partnerName = gs.chat.characters[0]?.name;
  const charactersDescription = getGroupDescription(gs.chat.characters);

  const systemPrompt = {
    role: 'system',
    content: `${playerName} and ${partnerName} are trading TCG cards.
    The user plays the role of ${playerName}.
    You play the role of ${partnerName}.
    ${playerName} just proposed a deal to ${partnerName}, you write how ${partnerName} reacts to it.
    The user message will include whether yoru character shoudl accept the trade or not.

    Instructions:
    - Use immersive third-person narration for the NPCs you control.
    - Include their body language, tone of voice, emotions, and internal thoughts.
    - Remain consistent with scene context and characters' personalities.
    - Use emotional nuance: subtext, body language, hesitation, indirect tension when appropriate.
    - Keep it short, one sentence.

    Characters:
    ${charactersDescription}
    `,
  };
  console.log('systemPrompt', systemPrompt.content);

  // reset initial system prompt
  gs.chat.history[0] = systemPrompt;

  const userPrompt = {
    role: 'user',
    content:
      'This was the trade proposal: ' +
      message +
      '. ${partnerName} ' +
      (accepted ? 'accepted' : 'rejected') +
      ' the trade.',
    displayLabel: message,
  };

  gs.chat.history.push(userPrompt);
  gs.chat.attemptedActionsResults = '';

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

  return transcript;
}
