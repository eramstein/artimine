import type { ActionAttempt, Character } from '../_model';
import { ActionType } from '../_model/enums-sim';
import { gs } from '../_state/main.svelte';
import { playerSendChat } from './chat';
import { LLM_API_TOOL_MODEL } from './config';
import { llmService, type ToolCall } from './llm-service';
import { getTools } from './tools';

async function getToolsFromText(message: string) {
  const systemMessage = {
    role: 'system',
    content: `You are a tool selection assistant. Your task is to carefully analyze the user's intent and select the most appropriate tool among those presented.`,
  };
  const query = {
    role: 'user',
    content: `This is the key information to select the tool, give it priority: ${message}.`,
  };
  const response = await llmService.chat({
    model: LLM_API_TOOL_MODEL,
    messages: [systemMessage, query],
    tools: getTools(),
    options: {
      temperature: 0.1, // Lower temperature for more deterministic responses
    },
  });
  console.log('getToolsFromText tools response', response);
  return response;
}

// Look into the player's message for actions that don't necessarily succeed
// Typically what would require a dice roll in a RPG, or propositions NPCs can refuse
export async function getActionsFromText(
  actionText: string,
  fromCharacter?: Character,
  toCharacters?: Character[]
): Promise<ActionAttempt[]> {
  const fromCharacterDescription = fromCharacter ? fromCharacter.name : gs.player.name;
  const charactersDescription =
    (toCharacters || gs.chat?.characters)?.map((c) => c.name).join(', ') || '';
  const message = `${fromCharacterDescription} says and does this in front of ${charactersDescription}: ${actionText} `;
  const llmResponse = await getToolsFromText(message);
  const toolCalls = llmService.getTools(llmResponse);
  if (toolCalls === undefined || toolCalls.length === 0) {
    console.log('No tool found');
    return [];
  }
  const tools = toolCalls as ToolCall[];
  return tools.map((tool) => {
    const actionType = tool.function.name as ActionType;
    const args = llmService.getToolArguments(tool.function.arguments);
    return {
      actionType,
      args,
    };
  });
}

export function recordActionInChat(actionDescription: string, triggerNpcReaction = false) {
  if (triggerNpcReaction) {
    playerSendChat(actionDescription);
  } else {
    gs.chat?.history.push({
      role: 'user',
      content: actionDescription,
    });
  }
}
