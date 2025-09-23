import type { Character, GroupActivityLog, Place, WorldFact } from '../_model';
import { ActivityType } from '../_model/enums-sim';
import { cosineSimilarity, getEmbedding } from './embeddings';
import { getChatsForCharacters, getWorldFacts } from './memories-db';

// returns a text describing relevant memories to be added to the chat system prompt
export async function getSystemPromptMemories(
  day: number,
  characters: Character[],
  place: Place,
  activityType: ActivityType,
  userMessage: string
) {
  const characterIds = characters.map((c) => c.key);

  const indexDbMemories = await getChatsForCharacters(characterIds, 0, day);

  const embeddedUserMessage = await getEmbedding(userMessage);

  // Add a score to each memory
  const scoredMemories = indexDbMemories
    .map((memory) => ({
      summary: memory.summary,
      score: scoreMemory(memory, {
        day,
        characters,
        place,
        activityType,
        embeddedUserMessage,
      }),
    }))
    .filter((m) => m.score > 0.5)
    .filter((m) => m.summary.length > 0);

  if (scoredMemories.length === 0) {
    return '';
  }

  // return top 2 memories summary with highest scores
  const topMemories = scoredMemories
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((memory) => memory.summary)
    .join('\n');

  const worldFacts = await getWorldFacts();
  console.log('worldFacts', worldFacts);
  const topWorldFacts = worldFacts
    .map((fact) => ({
      summary: fact.description,
      score: scoreWorldFact(fact, { embeddedUserMessage }),
    }))
    .filter((m) => m.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((fact) => fact.summary)
    .join('\n');

  return `${topMemories}\n\n${topWorldFacts}`;
}

function scoreMemory(
  memory: GroupActivityLog,
  context: {
    day: number;
    characters: Character[];
    place: Place;
    activityType: ActivityType;
    embeddedUserMessage: number[];
  }
) {
  const weights = {
    time: 0.5,
    characters: 0.1,
    location: 0.05,
    activity: 0.05,
    semantic: 0.3,
  };

  const time = timeScore(memory.day, context.day);
  const chars = memory.participants ? characterScore(memory.participants, context.characters) : 0;
  const loc = locationScore(memory.location, context.place.key);
  const act = activityScore(memory.activityType, context.activityType);
  const sem = cosineSimilarity(memory.embedding, context.embeddedUserMessage);

  return (
    weights.time * time +
    weights.characters * chars +
    weights.location * loc +
    weights.activity * act +
    weights.semantic * sem
  );
}

// score between ~1 (recent) and 0 (old)
function timeScore(memoryTime: number = 0, now: number = 0): number {
  const decay = 60 * 24 * 30; // 30 days
  const age = Math.abs(now - memoryTime);
  return Math.exp(-age / decay);
}

// score between ~1 (all participants overlap) and 0 (none overlap)
function characterScore(memoryParticipants: string[], currentCharacters: Character[]): number {
  const ids = currentCharacters.map((c) => c.key);
  const overlap = memoryParticipants.filter((id) => ids.includes(id)).length;
  return overlap / Math.max(ids.length, memoryParticipants.length);
}

function locationScore(memoryLoc: string | undefined, currentLoc: string): number {
  return memoryLoc === currentLoc ? 1 : 0;
}

function activityScore(memType: ActivityType | undefined, currentType: ActivityType): number {
  return memType === currentType ? 1 : 0;
}

function scoreWorldFact(worldFact: WorldFact, context: { embeddedUserMessage: number[] }): number {
  return cosineSimilarity(worldFact.embedding, context.embeddedUserMessage);
}
