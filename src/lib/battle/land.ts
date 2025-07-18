import type { Land, Player } from '../_model';
import { bs } from '../_state';

// lands open a color by setting it to 1, the player then has to increase it otherwise
export function incrementColorsFromLands(player: Player) {
  player.lands.forEach((land) => {
    land.colors.forEach((color) => {
      player.colors[color.color] = 1;
    });
  });
}

export function damageLand(land: Land, damage: number) {
  land.health -= damage;
  if (land.health <= 0) {
    bs.players[land.ownerPlayerId].lands = bs.players[land.ownerPlayerId].lands.filter(
      (l) => l.instanceId !== land.instanceId
    );
  }
}
