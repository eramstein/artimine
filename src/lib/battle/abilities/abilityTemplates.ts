import {
  damageUnit,
  healUnit,
  applyUnitStatus,
  summonUnit,
  makeUnit,
  DataTriggerTemplates,
} from '@/lib/battle';
import {
  type Trigger,
  type Ability,
  StatusType,
  type UnitDeployed,
  type Position,
  type UnitCardTemplate,
} from '@/lib/_model';
import { DataTriggerTemplates as TRIG } from './triggerTemplates';
import { DataTargetTemplates as TAR } from '../target';
import { DataEffectTemplates } from '../effects';
import { cards } from '@/data';
import { DataUnitFilters } from '../effects/unitFilters';

interface AbilityParams {
  name: string;
  cost?: number;
  trigger?: Trigger;
  exhausts?: boolean;
}

export const DataAbilityTemplates: {
  [key: string]: (p: AbilityParams, { ...any }) => Ability;
} = {
  cleave: (p, { damage }) => {
    return {
      text: 'Cleave ' + damage,
      icons: ['⚟'],
      trigger: TRIG.meAttack,
      effect: ({ triggerParams }) => {
        DataUnitFilters.adjacentAllies()(triggerParams.defender).forEach((u: UnitDeployed) => {
          damageUnit(u, damage);
        });
      },
      ...p,
    };
  },
  ping: (p, { damage, targetCount = 1 }) => {
    return {
      text: 'Ping ' + damage,
      trigger: TRIG.activated,
      targets: [TAR.ennemies(targetCount)],
      effect: ({ targets }) => {
        (targets[0] as UnitDeployed[]).forEach((u) => {
          damageUnit(u, damage);
        });
      },
      ...p,
    };
  },
  cc: (p, { duration, targetCount = 1, statusType = StatusType.Mezz }) => {
    return {
      text: statusType + ' ' + targetCount + ' unit for ' + duration + ' turns',
      trigger: TRIG.activated,
      targets: [TAR.ennemies(targetCount)],
      effect: ({ unit, targets }) => {
        (targets[0] as UnitDeployed[]).forEach((u: UnitDeployed) => {
          applyUnitStatus(u, statusType, duration);
        });
      },
      ...p,
    };
  },
  stun: (p, { duration, targetCount = 1 }) => {
    return {
      text: 'Stun ' + duration,
      trigger: TRIG.activated,
      targets: [TAR.ennemies(targetCount)],
      effect: ({ targets }) => {
        (targets[0] as UnitDeployed[]).forEach((u: UnitDeployed) => {
          applyUnitStatus(u, StatusType.Stun, duration);
        });
      },
      ...p,
    };
  },
  root: (p, { duration, targetCount = 1 }) => {
    return {
      text: 'Root ' + duration,
      trigger: TRIG.activated,
      targets: [TAR.ennemies(targetCount)],
      effect: ({ targets }) => {
        (targets[0] as UnitDeployed[]).forEach((u: UnitDeployed) => {
          applyUnitStatus(u, StatusType.Root, duration);
        });
      },
      ...p,
    };
  },
  healAdjacentOnMove: (p, { healValue }) => {
    return {
      text: 'Heal adjacent allies on move by ' + healValue,
      icons: ['♡'],
      trigger: TRIG.meMove,
      effect: ({ triggerParams }) => {
        DataUnitFilters.adjacentAllies()(triggerParams.mover).forEach((u: UnitDeployed) => {
          healUnit(u, healValue);
        });
      },
      ...p,
    };
  },
  buffAdjacentOnMove: (p, { attackValue }) => {
    return {
      text: 'Buff adjacent allies on move by ' + attackValue,
      trigger: TRIG.meMove,
      effect: DataEffectTemplates.buffAdjAlliesTemp({ power: attackValue }),
      ...p,
    };
  },
  summon: (p, { summonedUnit }) => {
    return {
      text: 'Summon ' + summonedUnit,
      trigger: TRIG.activated,
      targets: [TAR.allyCell()],
      effect: ({ unit, targets }) => {
        console.log('summon', unit, targets);
        (targets[0] as Position[]).forEach((cell: Position) => {
          const createdUnit = makeUnit(unit.ownerPlayerId, cards[summonedUnit] as UnitCardTemplate);
          summonUnit(createdUnit, cell);
        });
      },
      ...p,
    };
  },
  grows: (p, { growthValue }) => {
    return {
      text: `Turn start: gains ${growthValue} growth counters`,
      trigger: TRIG.myTurnStarts,
      effect: DataEffectTemplates.grow({ growthValue }),
      ...p,
    };
  },
  staticKeyword: (p, { keyword }) => {
    return {
      text: `Give ${keyword.key} ${keyword.value} to adjacent allies`,
      trigger: DataTriggerTemplates.static,
      effect: DataEffectTemplates.staticKeywordAdjAllies({
        name: keyword.key,
        keyword,
      }),
      ...p,
    };
  },
};
