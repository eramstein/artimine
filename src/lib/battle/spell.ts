import {
  type ActionDefinition,
  type EffectArgs,
  type EffectTargets,
  type SpellCard,
  type TargetDefinition,
} from '../_model';
import { bs } from '../_state';
import { isPayable } from './cost';
import { checkTargets } from './target';
import { discard } from './hand';

export function playSpell(spell: SpellCard, targets: EffectTargets[][]) {
  console.log(spell.name + ' on ' + (targets && targets.map((t) => JSON.stringify(t)).join(', ')));

  // CHECKS + COSTS
  // ----------------------------------------------------------------------
  if (!checkMultipleEffectsTargets(spell, spell.actions, targets)) {
    return;
  }
  if (!isPayable(spell) || paySpellCost(spell) === false) {
    return;
  }

  // EFFECTS
  // ----------------------------------------------------------------------
  const player = bs.players[spell.ownerPlayerId];
  spell.actions.forEach((actionDef, actionIndex) => {
    actionDef.effect({
      targets: targets[actionIndex],
      triggerParams: {},
      player,
    } as EffectArgs);
  });

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

function checkMultipleEffectsTargets(
  spell: SpellCard,
  actionDefs: ActionDefinition[],
  targets: EffectTargets[][]
): boolean {
  if (!Array.isArray(targets) || targets.length !== actionDefs.length) return false;
  for (let i = 0; i < actionDefs.length; i++) {
    if (!checkMultipleTargets(spell, actionDefs[i].targets || [], targets[i])) return false;
  }
  return true;
}
