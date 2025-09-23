import { AiTurnGoal, type Land, type Player, type UnitDeployed } from '@/lib/_model';
import { bs } from '@/lib/_state';
import { getRandomFromArray } from '../../../_utils/random';
import { getEmptyCells } from '../../boards';
import { attackLand, attackPlayer, attackUnit } from '../../combat';
import { moveUnit } from '../../move';
import { playSpell } from '../../spell';
import { deployUnit } from '../../unit';
import type { PossibleActions } from '../model';
import { type AiPersona } from '../model';
import { isAttackTargetLand, isAttackTargetPlayer, isAttackTargetUnit } from '../type-checks';
import { getHighestValueTarget } from '../valuations/attack';
import { getCounterAttackValue } from '../valuations/counter-attack';
import { getHighestMoveValue } from '../valuations/move';
import { valueUnit, wouldBeDestroyed } from '../valuations/unit';

export const AiPersonaNormal: AiPersona = {
  // TODO: assess all options together, we need comparable value estimates
  executeAction(possibleActions: PossibleActions) {
    // for spells we rely on cards aiHints and check if they match a goal
    if (possibleActions.playableSpells.length > 0 && bs.aiState.goals.length > 0) {
      const goalsMap = bs.aiState.goals.reduce(
        (acc, curr) => {
          acc[curr.goal] = curr.args;
          return acc;
        },
        {} as Record<AiTurnGoal, any>
      );
      for (const spell of possibleActions.playableSpells) {
        if (spell.aiHints?.some((hint) => goalsMap[hint])) {
          // for now AIs don't use spells with targets
          playSpell(spell, [[]]);
          return;
        }
      }
    }
    if (possibleActions.unitsWhoCanAttack?.length > 0) {
      // for now we don't try to order the attacks
      const unit = getRandomFromArray(possibleActions.unitsWhoCanAttack);
      const canAlsoMove =
        possibleActions.unitsWhoCanMove?.findIndex((u) => u.id === unit.id) !== -1;
      attackOrMove(unit, canAlsoMove);
      return;
    }
    if (possibleActions.deployableUnits?.length > 0) {
      const possiblePositions = getEmptyCells(false);
      if (possiblePositions.length === 0) return;
      const unitToDeploy = getRandomFromArray(possibleActions.deployableUnits);
      const bestMove = getHighestMoveValue(unitToDeploy);
      deployUnit(unitToDeploy, bestMove.cell);
      return;
    }
    if (possibleActions.unitsWhoCanMove?.length > 0) {
      const possiblePositions = getEmptyCells(false);
      if (possiblePositions.length === 0) return;
      const mover = getRandomFromArray(possibleActions.unitsWhoCanMove);
      const bestMove = getHighestMoveValue(mover);
      moveUnit(mover, bestMove.cell);
    }
    return;
  },
};

// figure out whether to attack or move based on expected values
// TODO: use current AiStrategy to weight alternatives
function attackOrMove(unit: UnitDeployed, canAlsoMove: boolean) {
  const bestAttack = getHighestValueTarget(unit);
  let bestAttackValue = bestAttack.value;
  if (
    bestAttack.target &&
    isAttackTargetUnit(bestAttack.target) &&
    !wouldBeDestroyed(bestAttack.target as UnitDeployed, unit)
  ) {
    bestAttackValue = valueUnit(bestAttack.target as UnitDeployed) / 2;
  }
  let counterAttackValue = 0;
  if (bestAttack.target && isAttackTargetUnit(bestAttack.target)) {
    counterAttackValue = getCounterAttackValue(unit, bestAttack.target as UnitDeployed);
  }
  const attackValue = bestAttackValue - counterAttackValue;
  if (!canAlsoMove || attackValue > 0) {
    if (isAttackTargetUnit(bestAttack.target as UnitDeployed)) {
      attackUnit(unit, bestAttack.target as UnitDeployed);
    } else if (isAttackTargetLand(bestAttack.target as Land)) {
      attackLand(unit, bestAttack.target as Land);
    } else if (isAttackTargetPlayer(bestAttack.target as Player)) {
      attackPlayer(unit, bestAttack.target!.id as number);
    }
  } else if (canAlsoMove) {
    const bestMove = getHighestMoveValue(unit);
    moveUnit(unit, bestMove.cell);
  }
}
