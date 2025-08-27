import type { EffectArgs, TargetDefinition } from '@/lib/_model/model-battle';
import { DataEffectTemplates } from './effect-templates';

/*
  These are specific types of effects that perform something before calling a standard effect.
  Typically cost-based effects (e.g. sacrifice creature, use energy counters, etc...).
*/

export const DataEffectPrimers: Record<
  string,
  (args: any) => { fn: (p: EffectArgs) => void; label: (targets: TargetDefinition[]) => string }
> = {
  useEnergy: ({
    effectTemplate,
    energyUsedForArgs,
    energyCost,
    otherArgs,
  }: {
    effectTemplate: keyof typeof DataEffectTemplates;
    energyUsedForArgs: any;
    energyCost?: number;
    otherArgs: any;
  }) => ({
    fn: ({ unit, player, targets, triggerParams }) => {
      const value = energyCost ?? unit.counters?.energy;
      if (!unit.counters?.energy || !value || (energyCost && value < energyCost)) {
        return;
      }
      DataEffectTemplates[effectTemplate]({ [energyUsedForArgs]: value, ...otherArgs }).fn({
        unit,
        player,
        targets,
        triggerParams,
      });
      unit.counters.energy -= value;
    },
    label: (targets: TargetDefinition[]) => {
      return DataEffectTemplates[effectTemplate]({
        [energyUsedForArgs]: energyCost ? ` equal to ${energyCost}` : ' equal to its energy',
        ...otherArgs,
      }).label(targets);
    },
  }),
};
