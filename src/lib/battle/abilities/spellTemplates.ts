import { CardColor, type EffectArgs, type Player, type TargetDefintion } from '@/lib/_model';
import { DataEffectTemplates } from '../effects';
import { DataTargetTemplates } from '../target';
import { incrementColor, untapPlayer } from '../player';

export const SpellTemplates: {
  [key: string]: ({ ...any }) => {
    effect: (p: EffectArgs) => void;
    target?: TargetDefintion;
  };
} = {
  dd: ({ damage, targets = 1 }) => {
    return {
      effect: DataEffectTemplates.damageUnit({ damage }),
      target: DataTargetTemplates.units(targets),
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
