import { cards } from '@/data';
import { ActivityType, type Npc } from '../_model';
import { gs } from '../_state';
import { saveActivityLog } from '../llm/memories-db';
import { addCardToCollection } from './collection';

// check for each character if they want to make a gift
export function rollGifts() {
  Object.values(gs.characters)
    .filter((c) => c.relationValues.friendship >= 0 && c.unlocks.cards.length > 0)
    .forEach((char) => {
      if (Math.random() > 1 - (char.relationValues.friendship + 10) / 10) {
        const card = char.unlocks.cards[Math.floor(Math.random() * char.unlocks.cards.length)];
        char.gifting.cards.push(card);
        char.unlocks.cards = char.unlocks.cards.filter((k) => k !== card);
      }
    });
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
