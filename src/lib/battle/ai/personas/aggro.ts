import {
  isLand,
  isPlayer,
  type BattleState,
  type UnitCardDeployed,
  type UnitCard,
} from '@/lib/_model';
import { getPossibleDeploymentPositions } from '../../boards';
import { attackLand, attackPlayer, attackUnit, validAttackTargets } from '../../combat';
import { deployUnit } from '../../unit';
import { ActionType, type AiPersona } from '../model';
import { getRandomFromArray } from '../utils/random';
import { moveUnit } from '../../move';
import type { PossibleActions } from '../model';

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
    const possiblePositions = getPossibleDeploymentPositions(false);
    if (possiblePositions.length === 0) return;
    deployUnit(getRandomFromArray(deployableUnits), getRandomFromArray(possiblePositions));
  },
  move(state: BattleState, unitsWhoCanMove: UnitCardDeployed[]) {
    const mover = getRandomFromArray(unitsWhoCanMove);
    const possiblePositions = getPossibleDeploymentPositions(false);
    if (possiblePositions.length === 0) return;
    moveUnit(mover, getRandomFromArray(possiblePositions));
  },
  attack(state: BattleState, unitsWhoCanAttack: UnitCardDeployed[]) {
    const attacker = getRandomFromArray(unitsWhoCanAttack);
    const targets = validAttackTargets(attacker);
    if (!targets || (Array.isArray(targets) && targets.length === 0)) return;
    if (Array.isArray(targets)) {
      attackUnit(attacker, getRandomFromArray(targets));
      return;
    }
    if (isLand(targets)) {
      attackLand(attacker, targets);
      return;
    }
    if (isPlayer(targets)) {
      attackPlayer(attacker, targets.id);
      return;
    }
  },
};
