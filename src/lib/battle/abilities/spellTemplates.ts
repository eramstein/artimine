import { CardColor, type EffectArgs, type Player, type TargetDefinition } from '@/lib/_model';
import { DataEffectTemplates, DataUnitFilters } from '../effects';
import { DataTargetTemplates } from '../target';
import { incrementColor, untapPlayer } from '../player';

export const SpellTemplates: {
  [key: string]: ({ ...any }) => {
    effect: (p: EffectArgs) => void;
    targets?: TargetDefinition[];
  };
} = {
  dd: ({ damage, targets = 1 }) => {
    return {
      effect: DataEffectTemplates.damageUnit({ damage }),
      targets: [DataTargetTemplates.units(targets)],
    };
  },
  addCounters: ({ counterType, counterValue, range = DataUnitFilters.self(), targets = 1 }) => {
    return {
      effect: DataEffectTemplates.addCounters({ counterType, counterValue, range }),
      targets: [DataTargetTemplates.units(targets)],
    };
  },
  reanimate: () => {
    return {
      effect: DataEffectTemplates.reanimate(),
      targets: [DataTargetTemplates.graveyardUnit(), DataTargetTemplates.cell()],
    };
  },
  ramp: ({ value = 1, color = CardColor }) => {
    return {
      effect: (p) => {
        incrementColor(p.player, color, value);
      },
    };
  },
  untapPlayer: () => {
    return {
      effect: (p) => {
        untapPlayer(p.player);
      },
    };
  },
};
