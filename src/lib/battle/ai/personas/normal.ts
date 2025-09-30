import {
  AiTurnGoal,
  CardType,
  type Card,
  type Land,
  type Player,
  type SpellCard,
  type UnitCard,
  type UnitDeployed,
} from '@/lib/_model';
import { bs } from '@/lib/_state';
import { getRandomFromArray } from '../../../_utils/random';
import { getEmptyCells } from '../../boards';
import { attackLand, attackPlayer, attackUnit } from '../../combat';
import { moveUnit } from '../../move';
import { playSpell } from '../../spell';
import { deployUnit } from '../../unit';
import type { PossibleActions } from '../model';
import { type AiPersona } from '../model';
import { selectAiSpellTargets } from '../target';
import { isAttackTargetLand, isAttackTargetPlayer, isAttackTargetUnit } from '../type-checks';
import { getHighestValueTarget } from '../valuations/attack';
import { getCounterAttackValue } from '../valuations/counter-attack';
import { getHighestMoveValue } from '../valuations/move';
import { valueUnit, wouldBeDestroyed } from '../valuations/unit';

export const AiPersonaNormal: AiPersona = {
  executeAction(possibleActions: PossibleActions) {
    // TODO: for now we give arbitrary priority to cards in hand vs units in play
    // it is usually preferable to play spells first but not always
    // ideally we would evaluate all options together, e.g. clear a blocker before attacking
    if (handleCardsToPlay(possibleActions)) return true;
    if (handleDeployedUnits(possibleActions)) return true;
    return false;
  },
};

// TODO: For cards in hand, we need to evaluate spells vs units deployment
// since they compete for the same resources
// returns true if an action was done
function handleCardsToPlay(possibleActions: PossibleActions): boolean {
  const goalsMap = bs.aiState.goals.reduce(
    (acc, curr) => {
      acc[curr.goal] = curr.args;
      return acc;
    },
    {} as Record<AiTurnGoal, any>
  );
  // priority 1: cards that match a goal
  if (bs.aiState.goals.length > 0) {
    for (const spell of possibleActions.playableSpells) {
      if (spell.aiHints?.some((hint) => goalsMap[hint])) {
        // for now AIs don't use spells with targets
        playSpell(spell, [[]]);
        return true;
      }
    }
    for (const unit of possibleActions.deployableUnits) {
      if (unit.aiHints?.some((hint) => goalsMap[hint])) {
        const bestPosition = getHighestMoveValue(unit as UnitDeployed);
        deployUnit(unit, bestPosition.cell);
        return true;
      }
    }
  }
  // priority 2: highest mana cost card (we assume for now it's the best value)
  const possiblePositions = getEmptyCells(false);
  // for board clear spells we do them only in the step before if it was a goal
  const spellsToConsider = possibleActions.playableSpells.filter((spell) => {
    return !spell.aiHints?.some((hint) => hint === AiTurnGoal.Reset);
  });
  let cardsToConsider: Card[] = [...spellsToConsider];
  if (possiblePositions.length > 0) {
    cardsToConsider = cardsToConsider.concat(possibleActions.deployableUnits);
  }
  if (cardsToConsider.length === 0) return false;
  const cardToPlay = cardsToConsider.sort((a, b) => b.cost - a.cost)[0];
  if (cardToPlay.type === CardType.Unit) {
    const bestPosition = getHighestMoveValue(cardToPlay as UnitDeployed);
    deployUnit(cardToPlay as UnitCard, bestPosition.cell);
    return true;
  }
  if (cardToPlay.type === CardType.Spell) {
    const targets = selectAiSpellTargets(cardToPlay as SpellCard);
    if (targets) {
      playSpell(cardToPlay as SpellCard, targets);
      return true;
    } else {
      bs.aiState.dismissedCards[cardToPlay.id] = true;
    }
  }
  return false;
}

// Deployed units each decide to attack or move independently, no overall strategy
// Not high on the priority list,
// it would be very hard to implement with little impact since there is no shared resources at stake
// returns true if an action was done
function handleDeployedUnits(possibleActions: PossibleActions): boolean {
  if (possibleActions.unitsWhoCanAttack?.length > 0) {
    const unit = getRandomFromArray(possibleActions.unitsWhoCanAttack);
    const canAlsoMove = possibleActions.unitsWhoCanMove?.findIndex((u) => u.id === unit.id) !== -1;
    attackOrMove(unit, canAlsoMove);
    return true;
  }
  if (possibleActions.unitsWhoCanMove?.length > 0) {
    const possiblePositions = getEmptyCells(false);
    if (possiblePositions.length === 0) return false;
    const mover = getRandomFromArray(possibleActions.unitsWhoCanMove);
    const bestMove = getHighestMoveValue(mover);
    moveUnit(mover, bestMove.cell);
    return true;
  }
  return false;
}

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

  const bestMove = getHighestMoveValue(unit);
  const counterattackAfterBestMove = getCounterAttackValue({ ...unit, position: bestMove.cell });

  if (!canAlsoMove || attackValue >= -counterattackAfterBestMove) {
    if (isAttackTargetUnit(bestAttack.target as UnitDeployed)) {
      attackUnit(unit, bestAttack.target as UnitDeployed);
    } else if (isAttackTargetLand(bestAttack.target as Land)) {
      attackLand(unit, bestAttack.target as Land);
    } else if (isAttackTargetPlayer(bestAttack.target as Player)) {
      attackPlayer(unit, bestAttack.target!.id as number);
    }
  } else if (canAlsoMove) {
    moveUnit(unit, bestMove.cell);
  }
}
