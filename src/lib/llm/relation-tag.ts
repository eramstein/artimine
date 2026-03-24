import { RelationTag } from '../_model';
import { gs } from '../_state';
import { llmService } from './llm-service';

export async function writeRelationChange(
  npcKey: string,
  relationTag: RelationTag
): Promise<string> {
  const npc = gs.characters[npcKey];
  if (!npc) {
    return '';
  }

  let relationDescription = '';
  if (relationTag === RelationTag.Lover) {
    relationDescription =
      'The NPC is confessing their romantic feelings and asking to become romantically involved (lovers).';
  } else if (relationTag === RelationTag.Mentor) {
    relationDescription =
      "The NPC is impressed by the player's character and asking to become their mentor, to guide them in their journey.";
  } else {
    return '';
  }

  const place = gs.places[npc.place];
  const timeOfDay = gs.time.period;
  const activityType = gs.activity.activityType;
  const eventDescription = gs.activity.event?.history[0] || gs.activity.event?.description || '';

  const systemPrompt = {
    role: 'system',
    content: `
    ### Instructions
    You are a dungeon master for a collaborative narrative RPG.
    Write a short scene where the NPC comes to the player's character to propose a change in their relationship.
    ${relationDescription}
    Keep it around 1 or 2 short paragraphs. Focus on the dialogue and the NPC's personality.
    The scene should feel grounded in the current moment and location.
    The scene should end with the NPC waiting for an answer.

    ### Player Character
      - **${gs.player.name}** ${gs.player.bio}

    ### NPC
      - **${npc.name}**: ${npc.bio}
      - **Personality:** ${npc.personality}
    
    ### Current Relationship
      - Friendship: ${npc.relationValues.friendship}
      - Respect: ${npc.relationValues.respect}
      - Love: ${npc.relationValues.love}

    ### Current Context
      - **Location:** ${place ? `${place.name} — ${place.description}` : 'unknown'}
      - **Time of day:** ${timeOfDay}
      - **Activity:** ${activityType}${eventDescription ? `\n      - **What just happened:** ${eventDescription}` : ''}
    `,
  };

  const userPrompt = {
    role: 'user',
    content: `Write the scene where ${npc.name} proposes this relationship change to ${gs.player.name}.`,
  };

  const response = await llmService.chat({
    messages: [systemPrompt, userPrompt],
    stream: false,
    options: {
      temperature: 0.8,
      max_tokens: 400,
    },
  });

  return llmService.getMessage(response as any);
}
