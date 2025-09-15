import type { Player } from '@/lib/_model';
import { activateAbility } from '@/lib/ui/_helpers/targetting';
import { isActivityPayable } from '../cost';

export function usePlayerLandAbility(player: Player): boolean {
  let playedAbility = false;
  player.lands.forEach((land) => {
    if (
      !player.abilityUsed &&
      land.abilities?.length &&
      isActivityPayable(land, land.abilities[0])
    ) {
      activateAbility(land, land.abilities[0]);
      playedAbility = true;
    }
  });
  return playedAbility;
}
