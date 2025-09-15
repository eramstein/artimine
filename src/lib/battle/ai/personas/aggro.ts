import { getRandomFromArray } from '../../../_utils/random';
import { getEmptyCells } from '../../boards';
import { autoAttack } from '../../combat';
import { moveUnit } from '../../move';
import { deployUnit } from '../../unit';
import type { PossibleActions } from '../model';
import { type AiPersona } from '../model';

export const AiPersonaAggro: AiPersona = {
  executeAction(possibleActions: PossibleActions) {
    if (possibleActions.unitsWhoCanAttack?.length > 0) {
      const attacker = getRandomFromArray(possibleActions.unitsWhoCanAttack);
      autoAttack(attacker);
      return;
    }
    if (possibleActions.deployableUnits?.length > 0) {
      const possiblePositions = getEmptyCells(false);
      if (possiblePositions.length === 0) return;
      deployUnit(
        getRandomFromArray(possibleActions.deployableUnits),
        getRandomFromArray(possiblePositions)
      );
      return;
    }
    if (possibleActions.unitsWhoCanMove?.length > 0) {
      const mover = getRandomFromArray(possibleActions.unitsWhoCanMove);
      const possiblePositions = getEmptyCells(false);
      if (possiblePositions.length === 0) return;
      moveUnit(mover, getRandomFromArray(possiblePositions));
    }
    return;
  },
};
