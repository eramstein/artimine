import type { Land, Player, UnitCardDeployed } from '../_model';
import { bs } from '../_state';

export function incrementColorsFromLands(player: Player) {
  player.lands.forEach((land) => {
    land.colors.forEach((color) => {
      player.colors[color.color] = (player.colors[color.color] ?? 0) + color.count;
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
