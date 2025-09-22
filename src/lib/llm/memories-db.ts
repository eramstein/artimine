import Dexie, { type Table } from 'dexie';
import type { GroupActivityLog, RelationshipSummaryUpdate } from '../_model';
import { getEmbedding } from './embeddings';

/*
  Long term memories database
  These are structured JSON to be queried by character, date...
  Semantic ones should use a vector DB like Chroma
*/

// Initialize Dexie database
const db = new Dexie('ArtimineDB');

// Define schema
db.version(1).stores({
  chats: 'id,day,activityType,[participants+day]',
  relationshipArcs: 'id,character',
});

// Export the chats table
const chats: Table<GroupActivityLog> = db.table('chats');

// Export the relationshipArcs table
const relationshipArcs: Table<RelationshipSummaryUpdate> = db.table('relationshipArcs');

// Save a chat to the database
export async function saveActivityLog(log: GroupActivityLog): Promise<number> {
  console.log('Saving activity log:', log);
  try {
    // call LLM to create embedding
    const embedding = await getEmbedding(log.summary);
    // store in IndexedDB
    const serializableLog = {
      id: String(log.id),
      day: Number(log.day),
      participants: Array.isArray(log.participants) ? log.participants.map((p) => String(p)) : [],
      location: String(log.location),
      activityType: log.activityType,
      summary: String(log.summary),
      embedding,
    };
    return await chats.put(serializableLog);
  } catch (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
}

// Fetch chats for a character within a time range
export async function getChatsForCharacters(
  characters: string[],
  startTime: number,
  endTime: number
): Promise<GroupActivityLog[]> {
  try {
    return await chats
      .where('day')
      .between(startTime, endTime, true, true)
      .filter((chat) => chat.participants.some((participant) => characters.includes(participant)))
      .toArray();
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
}

// Fetch a single chat by ID
export async function getChatById(id: number): Promise<GroupActivityLog | undefined> {
  try {
    return await chats.get(id);
  } catch (error) {
    console.error('Error fetching chat by ID:', error);
    throw error;
  }
}

// Delete chats older than a given day
export async function deleteOldChats(olderThan: number): Promise<void> {
  try {
    await chats.where('day').below(olderThan).delete();
  } catch (error) {
    console.error('Error deleting old chats:', error);
    throw error;
  }
}

export async function resetIndexDB(): Promise<void> {
  await chats.clear();
  await relationshipArcs.clear();
}

// Save a relationship summary update to the database
export async function saveRelationshipSummaryUpdate(
  id: string,
  npc: string,
  description: string,
  day: number
): Promise<number> {
  try {
    return await relationshipArcs.put({
      id,
      npc,
      description,
      day,
    });
  } catch (error) {
    console.error('Error saving relationship summary update:', error);
    throw error;
  }
}

// Fetch relationship summary updates for a character pair within a time range
export async function getRelationshipSummaryUpdates(
  npc: string,
  startTime: number,
  endTime: number
): Promise<RelationshipSummaryUpdate[]> {
  try {
    return await relationshipArcs
      .where('npc')
      .equals(npc)
      .filter((arc) => arc.day >= startTime && arc.day <= endTime)
      .toArray();
  } catch (error) {
    console.error('Error fetching relationship summary updates:', error);
    throw error;
  }
}

// Delete relationship summary updates older than a given day
export async function deleteOldRelationshipSummaryUpdates(olderThan: number): Promise<void> {
  try {
    await relationshipArcs.where('day').below(olderThan).delete();
  } catch (error) {
    console.error('Error deleting old relationship summary updates:', error);
    throw error;
  }
}
