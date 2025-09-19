import {
  type ActionDefinition,
  type EffectTargets,
  type SpellCard,
  type TargetDefinition,
} from '../_model';
import { bs } from '../_state';
import { chatOnLargeCardPlayed } from './chat';
import { isPayable } from './cost';
import { DataEffectTemplates } from './effects/effect-templates';
import { discard } from './hand';
import { checkTargets } from './target';

export function playSpell(spell: SpellCard, targets: EffectTargets[][]) {
  console.log(spell.name + ' on ' + (targets && targets.map((t) => JSON.stringify(t)).join(', ')));

  // CHECKS + COSTS
  // ----------------------------------------------------------------------
  if (!checkMultipleEffectsTargets(spell, spell.actions, targets)) {
    console.log('failed to check multiple effects targets');
    return;
  }
  if (!isPayable(spell) || paySpellCost(spell) === false) {
    console.log('failed to pay spell cost');
    return;
  }

  // EFFECTS
  // ----------------------------------------------------------------------
  const player = bs.players[spell.ownerPlayerId];
  spell.actions.forEach((actionDef, actionIndex) => {
    DataEffectTemplates[actionDef.effect.name](actionDef.effect.args).fn({
      targets: targets[actionIndex],
      triggerParams: {},
      player,
    });
  });

  // DISCARD
  // ----------------------------------------------------------------------
  discard(spell.instanceId, spell.ownerPlayerId);

  // Hint to LLM that a unit was deployed
  if (spell.cost >= 7) {
    chatOnLargeCardPlayed(spell);
  }
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

// TODO: this only works if all actions without targets are at the end of the spell
function checkMultipleEffectsTargets(
  spell: SpellCard,
  actionDefs: ActionDefinition[],
  targets: EffectTargets[][]
): boolean {
  const actionDefsWithTargets = actionDefs.filter((a) => a.targets);
  if (actionDefsWithTargets.length === 0) {
    return true;
  }
  if (!Array.isArray(targets) || targets.length !== actionDefsWithTargets.length) return false;
  for (let i = 0; i < actionDefsWithTargets.length; i++) {
    if (!checkMultipleTargets(spell, actionDefsWithTargets[i].targets || [], targets[i]))
      return false;
  }
  return true;
}
