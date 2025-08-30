import type { Card, Player } from '../_model';
import { onCardDrawn } from './listeners';

export function shuffleDeck(deck: Card[]): Card[] {
  return deck.sort(() => Math.random() - 0.5);
}

export function drawCard(player: Player) {
  const card = player.deck.shift();
  if (!card) return;
  player.hand.push(card);
  onCardDrawn(player, card);
}
