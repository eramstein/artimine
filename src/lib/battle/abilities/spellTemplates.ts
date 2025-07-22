import { type EffectArgs, type Target } from '@/lib/_model';
import { DataEffectTemplates } from '../effects';
import { DataTargetTemplates } from '../target';

export const SpellTemplates: {
  [key: string]: ({ ...any }) => { effect: (p: EffectArgs) => void; target: Target };
} = {
  dd: ({ damage, targets = 1 }) => {
    return {
      effect: DataEffectTemplates.damageUnit({ damage }),
      target: DataTargetTemplates.units(targets),
    };
  },
};
