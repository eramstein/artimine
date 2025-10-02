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
        const targets = selectAiSpellTargets(spell);
        if (targets) {
          playSpell(spell, targets);
          return true;
        } else {
          bs.aiState.dismissedCards[spell.id] = true;
        }
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

function handleDeployedUnits(possibleActions: PossibleActions): boolean {
  if (possibleActions.unitsWhoCanAttack?.length > 0) {
    const unit = getUnitWhoShouldAttackFirst(possibleActions.unitsWhoCanAttack);
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

// if there are allies in the same row, attack in the correct order which doesn't overkill a blocker
function getUnitWhoShouldAttackFirst(unitsWhoCanAttack: UnitDeployed[]): UnitDeployed {
  const unit = getRandomFromArray(unitsWhoCanAttack);
  const attackersInSameRow = unitsWhoCanAttack?.filter((u) => u.position.row === unit.position.row);

  // if there is only one attacker in the row, or if there are no blockers, just attack
  // ------------------------------------------------------------------------------------
  if (attackersInSameRow.length === 1) {
    return unit;
  }
  const blockers = bs.units.filter(
    (u) => u.ownerPlayerId !== unit.ownerPlayerId && u.position.row === unit.position.row
  );
  if (blockers.length === 0) {
    return unit;
  }

  // else, considering attacking with the other attacker in the row
  // ------------------------------------------------------------------------------------

  // if an attack has lance and there are several blockers, use it
  const lanceAttackers = attackersInSameRow.filter((u) => u.keywords?.lance);
  if (lanceAttackers.length > 0 && blockers.length > 1) {
    return lanceAttackers[0];
  }

  // TODO: handle cleave

  // can our smallest attacker kill the front blocker? if yes do it, else attack with the big one
  const frontBlocker = blockers.sort((a, b) => b.position.column - a.position.column)[0];
  const smallestAttacker = attackersInSameRow.sort((a, b) => a.power - b.power)[0];
  const biggestAttacker = attackersInSameRow.sort((a, b) => a.power - b.power)[1];
  if (wouldBeDestroyed(frontBlocker, smallestAttacker)) {
    return smallestAttacker;
  } else {
    return biggestAttacker;
  }
}
