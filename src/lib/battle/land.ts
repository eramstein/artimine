import type { Land, Player } from '../_model';
import { bs } from '../_state';

// lands open a color by setting it to 0, the player then has to increase it otherwise
export function initColorsFromLands(player: Player) {
  player.lands.forEach((land) => {
    land.colors.forEach((color) => {
      player.colors[color.color] = 9;
    });
  });
}

export function damageLand(land: Land, damage: number) {
  land.health -= damage;
  if (land.health <= 0) {
    destroyLand(land);
  }
}

export function destroyLand(land: Land) {
  bs.players[land.ownerPlayerId].lands = bs.players[land.ownerPlayerId].lands.filter(
    (l) => l.instanceId !== land.instanceId
  );
}

export function getAllLands(): Land[] {
  return bs.players.flatMap((p) => p.lands);
}

export function fortifyLand(land: Land, amount: number) {
  land.health += amount;
}
