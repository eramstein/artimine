import {
  TargetType,
  type EffectArgs,
  type Position,
  type SpellCard,
  type UnitDeployed,
} from '../_model';
import { bs } from '../_state';
import { getPossibleDeploymentPositions } from './boards';
import { isHumanPlayer } from './player';
import { isPayable } from './cost';
import { checkTargets } from './target';
import { discard } from './hand';

export function getEligibleSpellTargets(spell: SpellCard): UnitDeployed[] | Position[] {
  const target = spell.target;
  if (!target) {
    return [];
  }
  if (target.type === TargetType.Foe) {
    return bs.units.filter((u) => u.ownerPlayerId !== spell.ownerPlayerId);
  }
  if (target.type === TargetType.Ally) {
    return bs.units.filter((u) => u.ownerPlayerId === spell.ownerPlayerId);
  }
  if (target.type === TargetType.Any) {
    return bs.units;
  }
  if (target.type === TargetType.EmptyCell) {
    return [...getPossibleDeploymentPositions(true), ...getPossibleDeploymentPositions(false)];
  }
  if (target.type === TargetType.EmptyAllyCell) {
    const isPlayer = isHumanPlayer(spell.ownerPlayerId);
    return getPossibleDeploymentPositions(isPlayer);
  }
  return [];
}

export function playSpell(spell: SpellCard, targets: UnitDeployed[] | Position[]) {
  console.log(spell.name + ' on ' + (targets && targets.map((t) => JSON.stringify(t)).join(', ')));

  // CHECKS + COSTS
  // ----------------------------------------------------------------------
  if (spell.target && checkTargets(spell, spell.target, targets) === false) {
    return;
  }
  if (!isPayable(spell) || paySpellCost(spell) === false) {
    return;
  }

  // EFFECT
  // ----------------------------------------------------------------------
  spell.effect({
    targets,
    triggerParams: {},
    player: bs.players[spell.ownerPlayerId],
  } as EffectArgs);

  // DISCARD
  // ----------------------------------------------------------------------
  discard(spell.instanceId, spell.ownerPlayerId);
}

function paySpellCost(spell: SpellCard): boolean {
  const player = bs.players[spell.ownerPlayerId];
  if (spell.cost) {
    if (!player.mana || player.mana < spell.cost) {
      return false;
    }
    player.mana -= spell.cost;
  }
  return true;
}
