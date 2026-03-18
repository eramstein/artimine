import { gs } from '../_state';

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
