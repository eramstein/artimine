import {
  AiTurnGoal,
  type Ability,
  type Card,
  type EffectTargets,
  type Land,
  type Player,
  type Position,
  type SpellCard,
  type UnitDeployed,
} from '@/lib/_model';
import { bs } from '@/lib/_state';
import { getRandomFromArray } from '@/lib/_utils/random';
import { getEligibleTargets } from '../target';
import { valueUnit, wouldBeDestroyedBySpell } from './valuations/unit';

// random for now
export function selectAiAbilityTargets(unit: UnitDeployed, ability: Ability): EffectTargets[][] {
  const actions = ability.actions.map((action) => action.targets);
  if (actions.length === 0) {
    return [];
  }
  const effectTargets: EffectTargets[][] = [];
  actions.forEach((targetsDefinition, actionIndex) => {
    effectTargets.push([]);
    if (targetsDefinition) {
      targetsDefinition.forEach((targetDefinition, effectIndex) => {
        effectTargets[actionIndex].push([]);
        const potentialTargets = getEligibleTargets(unit, targetDefinition);
        const count = targetDefinition.count || 1;
        for (let i = 0; i < count; i++) {
          const t = getRandomFromArray(potentialTargets);
          effectTargets[actionIndex][effectIndex].push(t);
        }
      });
    }
  });
  return effectTargets;
}

export function selectAiSpellTargets(spell: SpellCard): EffectTargets[][] | null {
  const targets: EffectTargets[][] = [];
  let notEnoughTargets = false;
  spell.actions.forEach((action) => {
    const actionTargets: EffectTargets[] = [];
    if (action.targets) {
      action.targets.forEach((targetDefinition) => {
        const actionTargetGroup: UnitDeployed[] | Position[] | Land[] | Player[] | Card[] = [];
        const eligibleTargets = getEligibleTargets(spell, targetDefinition).filter((target) => {
          const isSpellPositive = !spell.aiHints?.some((hint) => hint === AiTurnGoal.RemoveUnit);
          return (
            !('ownerPlayerId' in target) ||
            (isSpellPositive && target.ownerPlayerId === spell.ownerPlayerId) ||
            (!isSpellPositive && target.ownerPlayerId !== spell.ownerPlayerId)
          );
        });
        const count = targetDefinition.count || 1;
        if (eligibleTargets.length < count) {
          notEnoughTargets = true;
          return;
        }
        for (let i = 0; i < count; i++) {
          const t: any = selectTarget(spell, eligibleTargets);
          actionTargetGroup.push(t);
        }
        actionTargets.push(actionTargetGroup);
      });
    }
    targets.push(actionTargets);
  });
  if (notEnoughTargets) {
    return null;
  }
  return targets;
}

function selectTarget(
  spell: SpellCard,
  potentialTargets: (UnitDeployed | Position | Land | Player | Card)[]
): UnitDeployed | Position | Land | Player | Card {
  const spellIsSpotRemoval = spell.aiHints?.some((hint) => hint === AiTurnGoal.RemoveUnit);

  // Spot removal
  if (spellIsSpotRemoval) {
    const creaturesToRemoveIds = bs.aiState.goals
      .filter((goal) => goal.goal === AiTurnGoal.RemoveUnit)
      .map((goal) => goal.args.unit.instanceId);
    const creaturesToRemove: UnitDeployed[] = potentialTargets.filter(
      (t) => 'instanceId' in t && creaturesToRemoveIds.includes(t.instanceId)
    ) as UnitDeployed[];
    if (creaturesToRemove.length > 0) {
      return getHighestKillValueTarget(spell, creaturesToRemove);
    }
    return getHighestKillValueTarget(spell, potentialTargets as UnitDeployed[]);
  }

  // by default, pick at random
  return getRandomFromArray(potentialTargets);
}

function getHighestKillValueTarget(
  spell: SpellCard,
  potentialTargets: UnitDeployed[]
): UnitDeployed {
  const killableTargets = potentialTargets.filter((t) => wouldBeDestroyedBySpell(t, spell));
  if (killableTargets.length === 0) {
    return getRandomFromArray(potentialTargets);
  }
  return killableTargets.sort((a, b) => valueUnit(a) - valueUnit(b))[0];
}
