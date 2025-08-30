import { CardType } from '@/lib/_model';
import { bs } from '@/lib/_state';

export enum DynamicValue {
  UnitsInGraveyard = 'units in graveyards',
}

export const DynamicValues: Record<DynamicValue, () => number> = {
  [DynamicValue.UnitsInGraveyard]: () => {
    return bs.players.reduce(
      (acc, player) => acc + player.graveyard.filter((c) => c.type === CardType.Unit).length,
      0
    );
  },
};
