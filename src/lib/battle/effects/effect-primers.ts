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
  combine: ({
    effectTemplates,
  }: {
    effectTemplates: {
      name: keyof typeof DataEffectTemplates;
      args: Record<string, any>;
    }[];
  }) => ({
    fn: ({ unit, player, targets, triggerParams }) => {
      effectTemplates.forEach((effectTemplate) => {
        DataEffectTemplates[effectTemplate.name](effectTemplate.args).fn({
          unit,
          player,
          targets,
          triggerParams,
        });
      });
    },
    label: (targets: TargetDefinition[]) => {
      return effectTemplates
        .map((effectTemplate) =>
          DataEffectTemplates[effectTemplate.name](effectTemplate.args).label(targets)
        )
        .join(' and ');
    },
  }),
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
      const energyUsed = energyCost ?? unit?.counters?.energy;
      if (!unit?.counters?.energy || (energyCost && unit?.counters?.energy < energyCost)) {
        console.log('not enough energy');
        return;
      }
      DataEffectTemplates[effectTemplate]({ [energyUsedForArgs]: energyUsed, ...otherArgs }).fn({
        unit,
        player,
        targets,
        triggerParams,
      });
      unit!.counters!.energy -= energyUsed ?? 0;
    },
    label: (targets: TargetDefinition[]) => {
      const costLabel = energyCost ? `${energyCost} energy: ` : 'All energy: ';
      return (
        costLabel +
        DataEffectTemplates[effectTemplate]({
          [energyUsedForArgs]: energyCost ? ` equal to ${energyCost}` : ' equal to its energy',
          ...otherArgs,
        }).label(targets)
      );
    },
  }),
  useGold: ({
    effectTemplate,
    goldUsedForArgs,
    goldCost,
    otherArgs,
  }: {
    effectTemplate: keyof typeof DataEffectTemplates;
    goldUsedForArgs: any;
    goldCost?: number;
    otherArgs: any;
  }) => ({
    fn: ({ unit, player, targets, triggerParams }) => {
      if (goldCost && player.gold < goldCost) {
        console.log('not enough gold');
        return;
      }
      DataEffectTemplates[effectTemplate]({ [goldUsedForArgs]: goldCost, ...otherArgs }).fn({
        unit,
        player,
        targets,
        triggerParams,
      });
      player.gold -= goldCost ?? 0;
    },
    label: (targets: TargetDefinition[]) => {
      const costLabel = goldCost ? `${goldCost} gold: ` : 'All gold: ';
      return (
        costLabel +
        DataEffectTemplates[effectTemplate]({
          [goldUsedForArgs]: goldCost ? ` equal to ${goldCost}` : ' equal to its gold',
          ...otherArgs,
        }).label(targets)
      );
    },
  }),
};
