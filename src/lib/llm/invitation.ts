import { gs } from '../_state';
import { llmService } from './llm-service';

export async function writeInvitation(npcKey: string): Promise<string> {
  const npc = gs.characters[npcKey];
  if (!npc || !npc.invitation) {
    return '';
  }

  const invitation = npc.invitation;
  const place = gs.places[invitation.place];
  const timeOfDay = invitation.dayPeriod;
  const activityType = invitation.activity.activityType;
  const inDays = invitation.day - gs.time.day;
  
  let timeDescription = '';
  if (inDays === 0) {
    timeDescription = `today in the ${timeOfDay}`;
  } else if (inDays === 1) {
    timeDescription = `tomorrow in the ${timeOfDay}`;
  } else {
    timeDescription = `in ${inDays} days, in the ${timeOfDay}`;
  }

  const systemPrompt = {
    role: 'system',
    content: `
    ### Instructions
    You are a dungeon master for a collaborative narrative RPG.
    Write a short scene where the NPC comes to the player's character to invite them to an activity.
    The invitation must mention what activity they will do, where it will take place, and when.
    Keep it around 1 or 2 short paragraphs. Focus on the dialogue and the NPC's personality.

    ### Player Character
      - **${gs.player.name}** ${gs.player.bio}

    ### NPC Inviting
      - **${npc.name}**: ${npc.bio}
      - **Personality:** ${npc.personality}
    
    ### Invitation Details
      - **Activity:** ${activityType}
      - **Location:** ${place.name} (${place.description})
      - **Time:** ${timeDescription}
    `,
  };

  const userPrompt = {
    role: 'user',
    content: `Write the scene where ${npc.name} invites ${gs.player.name} to this activity.`,
  };

  const response = await llmService.chat({
    messages: [systemPrompt, userPrompt],
    stream: false,
    options: {
      temperature: 0.7,
      max_tokens: 400,
    },
  });

  return llmService.getMessage(response as any);
}
