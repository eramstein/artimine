import type { CardColor, Player } from '@/lib/_model';
import { isPayable, isPayableAfterColorIncrementation } from '../cost';
import { usePlayerColorAbility } from '../player';

export function getColorToIncrement(player: Player): CardColor | null {
  // check if a card in hand requires only one increment, if yes return it
  const maxRequirementPerColor: Record<CardColor, number> = {
    blue: 0,
    black: 0,
    green: 0,
    red: 0,
  };
  for (const card of player.hand) {
    const payable = isPayable(card);
    const color = isPayableAfterColorIncrementation(card);
    if (!payable && color !== false && color !== true) {
      return color;
    } else {
      card.colors.forEach((color) => {
        maxRequirementPerColor[color.color] = Math.max(
          maxRequirementPerColor[color.color],
          color.count
        );
      });
    }
  }

  // else, increment the color with the lowest value unless they all are already enough for the hand
  const minColor: { color: CardColor; value: number } = Object.entries(player.colors)
    .map(([color, value]) => ({ color: color as CardColor, value: value }))
    .reduce((min, curr) => (curr.value < min.value ? curr : min));

  if (minColor.value < 2) {
    return minColor.color;
  }

  if (minColor.value < maxRequirementPerColor[minColor.color as CardColor]) {
    return minColor.color;
  }

  // else, don't increment any color
  return null;
}

export function incrementRandomColor(player: Player) {
  const colors = Object.keys(player.colors);
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  usePlayerColorAbility(player, randomColor as CardColor);
}
