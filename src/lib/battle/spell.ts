import {
  TargetType,
  type EffectArgs,
  type EffectTargets,
  type SpellCard,
  type TargetDefinition,
} from '../_model';
import { bs } from '../_state';
import { isPayable } from './cost';
import { checkTargets } from './target';
import { discard } from './hand';
import { drawCard } from './deck';

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
  const player = bs.players[spell.ownerPlayerId];
  spell.effect({
    targets,
    triggerParams: {},
    player,
  } as EffectArgs);

  if (spell.cantrip) {
    drawCard(player);
  }

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
