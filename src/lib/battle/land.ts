import type { Player } from '../_model';

export function incrementColorsFromLands(player: Player) {
  player.lands.forEach((land) => {
    land.colors.forEach((color) => {
      player.colors[color.color] = (player.colors[color.color] ?? 0) + color.count;
    });
  });
}
