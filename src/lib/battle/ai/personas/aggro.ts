import { type BattleState, type UnitDeployed, type UnitCard } from '@/lib/_model';
import { getEmptyCells } from '../../boards';
import { deployUnit } from '../../unit';
import { ActionType, type AiPersona } from '../model';
import { getRandomFromArray } from '../../../_utils/random';
import { moveUnit } from '../../move';
import type { PossibleActions } from '../model';
import { autoAttack } from '../../combat';

export const AiPersonaAggro: AiPersona = {
  selectActionType(state: BattleState, possibleActions: PossibleActions): ActionType | null {
    const actionTypes = [];
    if (possibleActions.unitsWhoCanAttack?.length > 0) {
      actionTypes.push(ActionType.Attack);
      return getRandomFromArray(actionTypes);
    }
    if (possibleActions.deployableUnits?.length > 0) {
      actionTypes.push(ActionType.Deploy);
      return getRandomFromArray(actionTypes);
    }
    if (possibleActions.unitsWhoCanMove?.length > 0) {
      actionTypes.push(ActionType.Move);
      return getRandomFromArray(actionTypes);
    }
    return null;
  },
  deploy(state: BattleState, deployableUnits: UnitCard[]) {
    const possiblePositions = getEmptyCells(false);
    if (possiblePositions.length === 0) return;
    deployUnit(getRandomFromArray(deployableUnits), getRandomFromArray(possiblePositions));
  },
  move(state: BattleState, unitsWhoCanMove: UnitDeployed[]) {
    const mover = getRandomFromArray(unitsWhoCanMove);
    const possiblePositions = getEmptyCells(false);
    if (possiblePositions.length === 0) return;
    moveUnit(mover, getRandomFromArray(possiblePositions));
  },
  attack(state: BattleState, unitsWhoCanAttack: UnitDeployed[]) {
    const attacker = getRandomFromArray(unitsWhoCanAttack);
    autoAttack(attacker);
  },
};
