import { CardColor, type EffectArgs, type Player, type TargetDefinition } from '@/lib/_model';
import { DataEffectTemplates, DataUnitFilters } from '../effects';
import { DataTargetTemplates } from '../target';
import { incrementColor, untapPlayer } from '../player';

export const SpellTemplates: {
  [key: string]: ({ ...any }) => {
    effect: (p: EffectArgs) => void;
    targets?: TargetDefinition[];
    text: string;
  };
} = {
  dd: ({ damage, targets = 1, range }) => {
    return {
      effect: DataEffectTemplates.damageUnit({ damage, range }),
      targets: [DataTargetTemplates.units(targets)],
      text: `Deal ${damage} damage to ${range?.name ?? 'a unit'} ${targets > 1 ? targets + ' times' : ''}`,
    };
  },
  addCounters: ({ counterType, counterValue, range = DataUnitFilters.self(), targets = 1 }) => {
    return {
      effect: DataEffectTemplates.addCounters({ counterType, counterValue, range }),
      targets: [DataTargetTemplates.units(targets)],
      text: `Add ${counterValue} ${counterType} counters to ${range?.name ?? 'a unit'} ${targets > 1 ? targets + ' times' : ''}`,
    };
  },
  reanimate: () => {
    return {
      effect: DataEffectTemplates.reanimate(),
      targets: [DataTargetTemplates.graveyardUnit(), DataTargetTemplates.cell()],
      text: 'Reanimate a unit from a graveyard',
    };
  },
  ramp: ({ value = 1, color = CardColor }) => {
    return {
      effect: (p) => {
        incrementColor(p.player, color, value);
      },
      text: `Gain ${value} ${color} mana`,
    };
  },
  untapPlayer: () => {
    return {
      effect: (p) => {
        untapPlayer(p.player);
      },
      text: 'Untap your hero ability',
    };
  },
};
