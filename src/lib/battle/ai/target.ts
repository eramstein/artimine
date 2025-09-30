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
import { getRandomFromArray } from '@/lib/_utils/random';
import { getEligibleTargets } from '../target';

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
          const t = getRandomFromArray(eligibleTargets);
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
