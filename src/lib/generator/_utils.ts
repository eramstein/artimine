import type { CardColor } from '../_model';
import { getRandomFromArray } from '../_utils/random';

export function getDominantColor(colors: { color: CardColor; count: number }[]): CardColor {
  const maxCount = Math.max(...colors.map((color) => color.count));
  const dominantColors = colors.filter((color) => color.count === maxCount);
  return getRandomFromArray(dominantColors).color;
}
