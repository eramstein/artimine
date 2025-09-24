import { type Ability, type EffectTargets, type UnitDeployed } from '@/lib/_model';
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
