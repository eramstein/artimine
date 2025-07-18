import type { Ability, Card, UnitDeployed } from '../_model';
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

export function isActivityPayable(unit: UnitDeployed, ability: Ability) {
  if (!ability.cost) {
    return true;
  }
  const player = bs.players[unit.ownerPlayerId];
  if (player.mana < ability.cost) {
    return false;
  }
  return true;
}

export function payCost(card: Card) {
  const player = bs.players[card.ownerPlayerId];
  player.mana -= card.cost;
}
