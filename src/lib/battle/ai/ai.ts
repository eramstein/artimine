import { config } from '@/lib/_config';
import { CardType, isUnitCard, type Player, type SpellCard, type UnitCard } from '@/lib/_model';
import { bs } from '@/lib/_state';
import { isBoardSizeFull } from '../boards';
import { canAttack } from '../combat';
import { isPayable } from '../cost';
import { canMove } from '../move';
import { usePlayerColorAbility } from '../player';
import { nextTurn } from '../turn';
import { getColorToIncrement, incrementRandomColor } from './colors';
import { getAiGoals } from './goals';
import { usePlayerLandAbility } from './lands';
import { PersonaType, type AiPersona, type PossibleActions } from './model';
import { AiPersonaAggro } from './personas/aggro';
import { AiPersonaNormal } from './personas/normal';
import { getAiStrategy } from './strategy';

const AI_PERSONA: PersonaType = PersonaType.Normal;
const MAX_ACTIONS_SAFETY_NET = 100;
let actionsPlayedthisTurn = 0;

export function playAiTurn() {
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

  bs.aiState.strategy = getAiStrategy(AI_PERSONA);
  bs.aiState.goals = getAiGoals(AI_PERSONA);
  bs.aiState.dismissedCards = {};

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

  if (bs.playerIdWon !== null) {
    return;
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
    : (leader.hand.filter(
        (unit) => isUnitCard(unit) && isPayable(unit) && !bs.aiState.dismissedCards[unit.id]
      ) as UnitCard[]);
  const playableSpells = leader.hand.filter(
    (spell) =>
      spell.type === CardType.Spell && isPayable(spell) && !bs.aiState.dismissedCards[spell.id]
  ) as SpellCard[];
  const unitsWhoCanMove = boardFull ? [] : leaderUnits.filter((unit) => canMove(unit));
  const unitsWhoCanAttack = leaderUnits.filter((unit) => canAttack(unit));
  const playerAbility = !leader.abilityUsed;
  return {
    deployableUnits,
    playableSpells,
    unitsWhoCanMove,
    unitsWhoCanAttack,
    playerAbility,
    count:
      deployableUnits.length +
      unitsWhoCanMove.length +
      unitsWhoCanAttack.length +
      playableSpells.length +
      (playerAbility ? 1 : 0),
  };
}
