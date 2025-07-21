import { bs } from '@/lib/_state';
import { ActionType, PersonaType, type AiPersona, type PossibleActions } from './model';
import { AiPersonaAggro } from './personas/aggro';
import { canMove } from '../move';
import { isBoardSizeFull } from '../boards';
import { isUnitCard, type Player, type UnitCard } from '@/lib/_model';
import { canAttack } from '../combat';
import { config } from '@/lib/_config';
import { nextTurn } from '../turn';
import { isPayable } from '../cost';
import { incrementColor, useDrawAbility } from '../player';
import { draw } from 'svelte/transition';
import { drawCard } from '../deck';

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
    const actionType = persona.selectActionType(bs, possibleActions);

    switch (actionType) {
      case ActionType.Deploy:
        persona.deploy(bs, possibleActions.deployableUnits);
        break;
      case ActionType.Move:
        persona.move(bs, possibleActions.unitsWhoCanMove);
        break;
      case ActionType.Attack:
        persona.attack(bs, possibleActions.unitsWhoCanAttack);
        break;
    }
  }

  setTimeout(() => {
    loopAiActions(persona);
  }, config.aiActionInterval);
}

function usePlayerAbility(persona: AiPersona, player: Player) {
  // Get all available colors (keys in player.colors with a defined value)
  const availableColors = Object.entries(player.colors)
    .filter(([color, value]) => value !== undefined)
    .map(([color, value]) => ({ color: color as any, value: value as number }));

  if (availableColors.length === 0) {
    player.abilityUsed = true;
    return;
  }

  // Find the color with the lowest value
  const minColor = availableColors.reduce((min, curr) => (curr.value < min.value ? curr : min));

  // increment colors until 5 in each ,then draw
  // TODO: only increment based on AI deck's needs
  if (minColor.value < 5) {
    incrementColor(player, minColor.color);
  } else if (player.mana >= 1) {
    useDrawAbility(player);
  } else {
    player.abilityUsed = true;
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
