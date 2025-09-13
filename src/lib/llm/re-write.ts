import { gs } from '../_state/main.svelte';
import { llmService } from './llm-service';

export async function rewriteMessageAfterFail(message: string): Promise<string> {
  if (!gs.chat?.attemptedActionsResults) {
    return message;
  }
  const failureMessage = `This is what went sideways: ${gs.chat.attemptedActionsResults}`;

  const systemPrompt = {
    role: 'system',
    content: `
    You are a narrative rewriter for a role-playing game.
    The player described their character’s intended actions.
    The game logic detected a failure in an action, your job is to rewrite the player’s description so that it includes the failure in a natural, immersive way.

    Guidelines:
    - Preserve the original structure and intent of the player’s description.
    - Insert the failure at the exact point of the attempted action.
    - Make the failure clear and unambiguous.
    - Keep the text immersive and consistent with the tone of a fantasy RPG.
    - Do not add extra consequences unless implied by the failure (e.g., falling causes pain, slipping causes embarrassment).
    - Always keep the character’s name, setting, and other successful actions intact.
    - If Critical Failure is detected, add a dramatic, intersting and unexpected description of the failure.

    Example input:
    User message: Antoine enters, performs a backflip, and sits at the table.
    Failure: Antoine failed to perform a backflip. Critical failure!

    Output: 
    Antoine enters, attempts to perform a backflip, but fails and lands on the floor, starting to cry in pain.
    `,
  };

  const userPrompt = {
    role: 'user',
    content: 'User message: ' + message + '\n\n' + 'Failure: ' + failureMessage,
  };

  const response = await llmService.chat({
    messages: [systemPrompt, userPrompt],
  });

  return llmService.getMessage(response);
}
