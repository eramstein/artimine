import {
  TargetType,
  type EffectArgs,
  type EffectTargets,
  type SpellCard,
  type TargetDefinition,
} from '../_model';
import { bs } from '../_state';
import { getEmptyCells } from './boards';
import { isHumanPlayer } from './player';
import { isPayable } from './cost';
import { checkTargets } from './target';
import { discard } from './hand';
import { getAllGraveyardsCards } from './graveyard';

export function getEligibleSpellTargets(spell: SpellCard): EffectTargets[] {
  const targets: EffectTargets[] = [];
  const defs = spell.targets || [];
  for (const def of defs) {
    if (def.type === TargetType.Foe) {
      targets.push(bs.units.filter((u) => u.ownerPlayerId !== spell.ownerPlayerId));
    } else if (def.type === TargetType.Ally) {
      targets.push(bs.units.filter((u) => u.ownerPlayerId === spell.ownerPlayerId));
    } else if (def.type === TargetType.Any) {
      targets.push(bs.units);
    } else if (def.type === TargetType.EmptyCell) {
      targets.push([...getEmptyCells(true), ...getEmptyCells(false)]);
    } else if (def.type === TargetType.EmptyAllyCell) {
      const isPlayer = isHumanPlayer(spell.ownerPlayerId);
      targets.push(getEmptyCells(isPlayer));
    } else if (def.type === TargetType.GraveyardCard) {
      targets.push(getAllGraveyardsCards());
    } else {
      targets.push([]);
    }
  }
  return targets;
}

export function playSpell(spell: SpellCard, targets: EffectTargets[]) {
  console.log(spell.name + ' on ' + (targets && targets.map((t) => JSON.stringify(t)).join(', ')));

  // CHECKS + COSTS
  // ----------------------------------------------------------------------
  if (spell.targets && !checkMultipleTargets(spell, spell.targets, targets)) {
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

// New helper for multiple targets
function checkMultipleTargets(
  spell: SpellCard,
  defs: TargetDefinition[],
  targets: EffectTargets[]
): boolean {
  if (!Array.isArray(targets) || targets.length !== defs.length) return false;
  for (let i = 0; i < defs.length; i++) {
    if (!checkTargets(spell, defs[i], targets[i])) return false;
  }
  return true;
}
