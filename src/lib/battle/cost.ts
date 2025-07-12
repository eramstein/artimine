import type { Card } from '../_model';
import { bs } from '../_state';

export function isPayable(card: Card) {
  const player = bs.players[card.ownerPlayerId];
  if (player.mana < card.cost) {
    return false;
  }
  if (card.colors.some((color) => (player.colors[color.color] || 0) < color.count)) {
    return false;
  }
  return true;
}

export function payCost(card: Card) {
  const player = bs.players[card.ownerPlayerId];
  player.mana -= card.cost;
}
