import { uiState } from '../_state';
import { gs } from '../_state/main.svelte';
import { getGroupDescription } from './chat-helpers';
import { llmService } from './llm-service';

export async function sendBattleEvent(message: string): Promise<string> {
  if (!gs.chat) {
    return '';
  }

  const playerName = gs.player.name;
  const opponentName = gs.chat.characters[0]?.name;
  const charactersDescription = getGroupDescription(gs.chat.characters);

  const systemPrompt = {
    role: 'system',
    content: `${playerName} and ${opponentName} are playing a card game called Horde.
    The user plays the role of ${playerName}.
    You play the role of ${opponentName}.
    Some just event happened in the game, describe in one sentence how ${opponentName} reacts to it.

    Instructions:
    - Use immersive third-person narration for ${opponentName}.
    - Do not include any narrative prose describing ${playerName}.
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
    content: 'This just happened in the game: ' + message,
    displayLabel: message,
    fromEngine: true,
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
