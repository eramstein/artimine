import { cards } from '@/data';
import { ActivityType, type Npc } from '../_model';
import { gs } from '../_state';
import { saveActivityLog } from '../llm/memories-db';
import { addCardToCollection } from './collection';

export function unlockGift(character: Npc) {
  const card = character.unlocks.cards[Math.floor(Math.random() * character.unlocks.cards.length)];
  character.gifting.cards.push(card);
  character.unlocks.cards = character.unlocks.cards.filter((k) => k !== card);
}

export function acceptCardGifts(character: Npc) {
  const giftedCardsIds = character.gifting.cards;
  gs.characters[character.key].gifting.cards = [];
  giftedCardsIds.forEach((cardId) => {
    addCardToCollection(cardId);
  });
  const cardNames = giftedCardsIds.map((cardId) => cards[cardId].name).join(', ');
  saveActivityLog({
    id: crypto.randomUUID(),
    activityType: ActivityType.Gift,
    participants: [character.key, gs.player.key],
    location: gs.places[character.place].key,
    day: gs.time.day,
    summary: `${character.name} gave ${gs.player.name} ${giftedCardsIds.length} cards: ${cardNames}.`,
    embedding: [],
  });
}
