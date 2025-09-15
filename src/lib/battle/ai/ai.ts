import { config } from '@/lib/_config';
import { isUnitCard, type Player, type UnitCard } from '@/lib/_model';
import { bs } from '@/lib/_state';
import { isBoardSizeFull } from '../boards';
import { canAttack } from '../combat';
import { isPayable } from '../cost';
import { canMove } from '../move';
import { usePlayerColorAbility } from '../player';
import { nextTurn } from '../turn';
import { getColorToIncrement, incrementRandomColor } from './colors';
import { usePlayerLandAbility } from './lands';
import { PersonaType, type AiPersona, type PossibleActions } from './model';
import { AiPersonaAggro } from './personas/aggro';
import { AiPersonaNormal } from './personas/normal';

const AI_PERSONA: PersonaType = PersonaType.Normal;
const MAX_ACTIONS_SAFETY_NET = 100;
let actionsPlayedthisTurn = 0;

export function playAiTurn() {
  console.log('playing AI', bs);

  let persona: AiPersona;
  switch (AI_PERSONA) {
    case PersonaType.Aggro:
      persona = AiPersonaAggro;
      break;
    case PersonaType.Normal:
    default:
      persona = AiPersonaNormal;
      break;
  }

  setTimeout(() => {
    loopAiActions(persona);
  }, 500);
}

function loopAiActions(persona: AiPersona) {
  actionsPlayedthisTurn++;

  const player = bs.players[1];
  const possibleActions = getPossibleActions(false);

  if (possibleActions.count === 0 || actionsPlayedthisTurn > MAX_ACTIONS_SAFETY_NET) {
    console.log('No actions screenLeft, passing', actionsPlayedthisTurn);
    nextTurn();
    return;
  }

  if (possibleActions.playerAbility) {
    usePlayerAbility(persona, player);
  } else {
    persona.executeAction(possibleActions);
  }

  setTimeout(() => {
    loopAiActions(persona);
  }, config.aiActionInterval);
}

function usePlayerAbility(persona: AiPersona, player: Player) {
  const neededColor = getColorToIncrement(player);
  if (neededColor) {
    usePlayerColorAbility(player, neededColor);
  } else {
    const playedAbility = usePlayerLandAbility(player);
    if (!playedAbility) {
      incrementRandomColor(player);
    }
  }
}

function getPossibleActions(isLeaderPlayer: boolean): PossibleActions {
  const leader = isLeaderPlayer ? bs.players[0] : bs.players[1];
  const leaderUnits = bs.units.filter((u) => u.ownerPlayerId === leader.id);
  const boardFull = isBoardSizeFull(leader);
  const deployableUnits = boardFull
    ? []
    : (leader.hand.filter((unit) => isUnitCard(unit) && isPayable(unit)) as UnitCard[]);
  const unitsWhoCanMove = boardFull ? [] : leaderUnits.filter((unit) => canMove(unit));
  const unitsWhoCanAttack = leaderUnits.filter((unit) => canAttack(unit));
  const playerAbility = !leader.abilityUsed;
  return {
    deployableUnits,
    unitsWhoCanMove,
    unitsWhoCanAttack,
    playerAbility,
    count:
      deployableUnits.length +
      unitsWhoCanMove.length +
      unitsWhoCanAttack.length +
      (playerAbility ? 1 : 0),
  };
}
