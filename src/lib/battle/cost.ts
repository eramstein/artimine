import type { Ability, Card, CardColor, Land, UnitDeployed } from '../_model';
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

// checks if that card is playable provided we increment one color
// returns false if not possible
// returns true if not needed (already can pay)
// returns color if one increment makes it possible
export function isPayableAfterColorIncrementation(card: Card): CardColor | boolean {
  const player = bs.players[card.ownerPlayerId];
  if (player.abilityUsed) {
    return isPayable(card);
  }
  if (player.mana < card.cost) {
    return false;
  }
  let colorsAlreadyMet = 0;
  let colorsOutOfReach = 0;
  let colorsInReachAfterIncrement: CardColor[] = [];
  card.colors.forEach((color) => {
    if ((player.colors[color.color] || 0) >= color.count) {
      colorsAlreadyMet++;
    } else if (player.colors[color.color] === color.count - 1) {
      colorsInReachAfterIncrement.push(color.color);
    } else if ((player.colors[color.color] || 0) < color.count - 1) {
      colorsOutOfReach++;
    }
  });
  if (colorsAlreadyMet === card.colors.length) {
    return true;
  }
  if (colorsInReachAfterIncrement.length > 1 || colorsOutOfReach > 0) {
    return false;
  }
  return colorsInReachAfterIncrement[0];
}

export function isActivityPayable(source: UnitDeployed | Land, ability: Ability) {
  if (!ability.cost) {
    return true;
  }
  const player = bs.players[source.ownerPlayerId];
  if (player.mana < ability.cost) {
    return false;
  }
  return true;
}

export function payCost(card: Card) {
  const player = bs.players[card.ownerPlayerId];
  player.mana -= card.cost;
}
