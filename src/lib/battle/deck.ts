import type { Card, Player } from '../_model';

export function shuffleDeck(deck: Card[]): Card[] {
  return deck.sort(() => Math.random() - 0.5);
}

export function drawCard(player: Player) {
  const card = player.deck.shift();
  if (!card) return;
  player.hand.push(card);
}
