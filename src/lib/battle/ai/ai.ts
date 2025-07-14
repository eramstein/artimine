import { bs } from '@/lib/_state';
import { ActionType, PersonaType, type AiPersona, type PossibleActions } from './model';
import { AiPersonaAggro } from './personas/aggro';
import { canMove } from '../move';
import { isBoardSizeFull } from '../boards';
import { isUnitCard, type UnitCard } from '@/lib/_model';
import { canAttack } from '../combat';
import { config } from '@/lib/_config';
import { nextTurn } from '../turn';
import { isPayable } from '../cost';

const AI_PERSONA = PersonaType.Aggro;
const MAX_ACTIONS_SAFETY_NET = 100;
let actionsPlayedthisTurn = 0;

export function playAiTurn() {
  console.log('playing AI', bs);

  let persona: AiPersona;
  switch (AI_PERSONA) {
    case PersonaType.Aggro:
      persona = AiPersonaAggro;
      break;
    default:
      persona = AiPersonaAggro;
      break;
  }

  setTimeout(() => {
    loopAiActions(persona);
  }, 500);
}

function loopAiActions(persona: AiPersona) {
  actionsPlayedthisTurn++;

  // TODO: leader actions
  //const leader = bs.players[1];

  const possibleActions = getPossibleActions(false);
  console.log('possibleActions', possibleActions);

  if (possibleActions.count === 0 || actionsPlayedthisTurn > MAX_ACTIONS_SAFETY_NET) {
    console.log('No actions screenLeft, passing', actionsPlayedthisTurn);
    nextTurn();
    return;
  }

  const battleState = bs;
  const actionType = persona.selectActionType(battleState, possibleActions);

  switch (actionType) {
    case ActionType.Deploy:
      persona.deploy(battleState, possibleActions.deployableUnits);
      break;
    case ActionType.Move:
      persona.move(battleState, possibleActions.unitsWhoCanMove);
      break;
    case ActionType.Attack:
      persona.attack(battleState, possibleActions.unitsWhoCanAttack);
      break;
  }

  setTimeout(() => {
    loopAiActions(persona);
  }, config.aiActionInterval);
}

function getPossibleActions(isLeaderPlayer: boolean): PossibleActions {
  const leader = isLeaderPlayer ? bs.players[0] : bs.players[1];
  const leaderUnits = bs.units.filter((u) => u.ownerPlayerId === leader.id);
  const deployableUnits = leader.hand.filter(
    (unit) => isUnitCard(unit) && isPayable(unit)
  ) as UnitCard[];
  const unitsWhoCanMove = isBoardSizeFull(leader)
    ? []
    : leaderUnits.filter((unit) => canMove(unit));
  const unitsWhoCanAttack = leaderUnits.filter((unit) => canAttack(unit));
  return {
    deployableUnits,
    unitsWhoCanMove,
    unitsWhoCanAttack,
    count: deployableUnits.length + unitsWhoCanMove.length + unitsWhoCanAttack.length,
  };
}
