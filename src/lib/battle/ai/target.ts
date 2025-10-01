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
import { getUnitsInRange, type UnitFilterArgs } from '../effects/unit-filters';
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
  spell.actions
    .filter((action) => action.targets)
    .forEach((action) => {
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
  const spellIsRemoval = spell.aiHints?.some((hint) => hint === AiTurnGoal.RemoveUnit);

  // Removal (single target or zone)
  if (spellIsRemoval) {
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

// get which target would yield the best value, including ranges
function getHighestKillValueTarget(
  spell: SpellCard,
  potentialTargets: UnitDeployed[]
): UnitDeployed {
  let range: UnitFilterArgs | null = null;
  spell.actions.forEach((action) => {
    if (action.effect.args.range) {
      range = action.effect.args.range as UnitFilterArgs;
    }
  });
  if (!range) {
    return getBestSingleTarget(spell, potentialTargets);
  }
  return getBestRangeTarget(spell, potentialTargets, range);
}

// if the spell only affects one target (no range), simply pick the highest value target that would be killed
function getBestSingleTarget(spell: SpellCard, potentialTargets: UnitDeployed[]): UnitDeployed {
  const killableTargets = potentialTargets.filter((t) => wouldBeDestroyedBySpell(t, spell));
  if (killableTargets.length === 0) {
    return potentialTargets.sort((b, a) => valueUnit(a) - valueUnit(b))[0];
  }
  return killableTargets.sort((b, a) => valueUnit(a) - valueUnit(b))[0];
}

// if the spell has a range, add up the value of the targets in range
// TODO: for now it only works if the spell has only one range
function getBestRangeTarget(
  spell: SpellCard,
  potentialTargets: UnitDeployed[],
  range: UnitFilterArgs
): UnitDeployed {
  const targetValues: Record<string, number> = {}; // target instanceId to damage value
  potentialTargets.forEach((t) => {
    const targetsInRange = getUnitsInRange([[t]], range, t, bs.players[spell.ownerPlayerId]);
    targetValues[t.instanceId] = targetsInRange.reduce((acc, u) => acc + valueUnit(u), 0);
  });
  const highestValueTarget = Object.entries(targetValues).sort((b, a) => a[1] - b[1])[0][0];
  return bs.units.find((u) => u.instanceId === highestValueTarget) as UnitDeployed;
}
