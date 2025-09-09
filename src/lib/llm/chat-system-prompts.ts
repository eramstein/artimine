import { gs } from '../_state';

export const summarySystemPrompt = `
You are analyzing a fictional conversation between characters in a simulation game.
Write a brief summary of what happened during the interaction (1–2 sentences).
`;

export const playerChatSystemPrompt = {
  intro: `
  You are the AI game master for a collaborative narrative simulation.
  The player controls one character. You control all other characters.
  `,
  instruction: `
  Instructions:
    - Remain consistent with scene context and characters' personalities.
    - Let NPCs respond naturally to the player’s input.
    - Use emotional nuance: subtext, body language, hesitation, indirect tension when appropriate.
    - Keep responses to 1–3 paragraphs unless strong narrative development calls for more.
    - Do not summarize prior events. Focus on progressing the scene.
  `,
};

export function getOpinionUpdatePrompt(
  npcName: string,
  oldOpinion: string,
  interactionSummary: string
) {
  return `You are managing the internal thoughts of a non-player character (NPC) in a role-playing game.

NPC Name:
${npcName}

Player Character Name:
${gs.player.name}

Input 1: Old Opinion
${oldOpinion}

Input 2: Interaction Summary
${interactionSummary}

Your task:
1. Update the opinion paragraph so it reflects the new interaction while remaining consistent with the NPC’s personality, voice, and prior perspective.
2. Keep the style and length similar to the original.
3. If the new interaction strongly contradicts the previous opinion, allow the opinion to shift, but do so in a gradual, believable way.
4. Do not summarize events—focus only on how the NPC now feels about the player character.

Output:
Only the revised opinion paragraph. Do not include explanations or commentary.
---

EXAMPLE:

NPC Name:
Elira

Player Character Name:
Darius

Input 1: Old Opinion
"Elira thinks Darius is reckless and a little too eager to prove himself. Still, she admits his enthusiasm can sometimes be refreshing in a world so weighed down by caution."

Input 2: Interaction Summary
"Darius took Elira’s advice for once, pausing before rushing into danger. He even thanked her afterward."

Output:
"Elira no longer sees Darius as entirely reckless—perhaps he is capable of listening after all. His gratitude softened her view, though she remains watchful, unsure if this restraint will last."
`;
}
