import { config } from '../_config';
import type { Npc } from '../_model';
import { gs } from '../_state';
import { clamp } from '../_utils/random';
import { LLM_API_TOOL_MODEL } from './config';
import { llmService } from './llm-service';
import { saveRelationshipSummaryUpdate } from './memories-db';

function updateOpinion(
  npcKey: string,
  npcName: string,
  oldOpinion: string,
  interactionSummary: string
) {
  const prompt = `
    Update the current opinion of ${npcName} about ${gs.player.name} based on their previous opinion and recent events.
    Output a single JSON object with ${npcName}'s opinion, structured as follows:

    - summary: A narrative summary (4-6 sentences) describing ${npcName}'s current feelings toward ${gs.player.name}, and a description of their relationship.
    - gameTags: Independant from the summary. An object with the following required fields.      
    - respect: how much does ${npcName} respect ${gs.player.name} compared to before the recent events?
    - friendship: how much does ${npcName} like ${gs.player.name} as a friend compared to before the recent events?
    - love: how interested is ${npcName} in ${gs.player.name} as a romantic partner compared to before the recent events?

    Each of them records a value between representing how much that feeling of ${npcName} about ${gs.player.name} has changed.
    Values can be from -3 (very negative change) to + 3 (very positive change). If no significant change, set the value to 0.
        
    Instructions:

    Use the provided previous opinion and new memories to update ${npcName}'s opinion.
    Ensure the summary reflects ${npcName}'s personality, recent interactions, and evolving relationship with ${gs.player.name}.
    Use only the allowed values for enum fields.
    Output only the JSON object, with no additional text.

    Previous Opinion:
    summary: ${oldOpinion}

    New Memories:
    ${interactionSummary}

    Output Format:
    {
      "summary": "string",
      "gameTags": {
        "respect": "number",
        "friendship": "number",
        "love": "number",
      }
    }
  `;

  llmService
    .chat({
      model: LLM_API_TOOL_MODEL,
      stream: false,
      responseFormat: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
    })
    .then((m) => {
      const opinion = llmService.getMessage(m);
      const formattedOpinion = JSON.parse(opinion);
      console.log('new opinion', formattedOpinion);
      gs.characters[npcKey].relationSummary = formattedOpinion.summary;
      if (formattedOpinion.gameTags) {
        if (formattedOpinion.gameTags.respect) {
          gs.characters[npcKey].relationValues.respect = clamp(
            gs.characters[npcKey].relationValues.respect + formattedOpinion.gameTags.respect,
            -config.opinionMaxValue,
            config.opinionMaxValue
          );
        }
        if (formattedOpinion.gameTags.friendship) {
          gs.characters[npcKey].relationValues.friendship = clamp(
            gs.characters[npcKey].relationValues.friendship + formattedOpinion.gameTags.friendship,
            -config.opinionMaxValue,
            config.opinionMaxValue
          );
        }
        if (formattedOpinion.gameTags.love) {
          gs.characters[npcKey].relationValues.love = clamp(
            gs.characters[npcKey].relationValues.love + formattedOpinion.gameTags.love,
            -config.opinionMaxValue,
            config.opinionMaxValue
          );
        }
      }
    });
}

export async function updateNpcRelation(npc: Npc) {
  // save old opinion in DB to build a relationship arc over time
  await saveRelationshipSummaryUpdate(npc.key, npc.relationSummary, gs.time.day);
  // update opinion
  await updateOpinion(npc.key, npc.name, npc.relationSummary, npc.period.interactionsSummary);
}
