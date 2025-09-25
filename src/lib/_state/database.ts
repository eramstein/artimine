import Dexie from 'dexie';

// Initialize Dexie database
export const db = new Dexie('ArtimineDB');

// Define schema
db.version(1).stores({
  chats: 'id,day,activityType,[participants+day]',
  relationshipArcs: 'id,character',
  worldFacts: 'id,description',
  savedGames: 'id',
});
