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
  CounterType,
} from '@/lib/_model';
import { DataTriggerTemplates as TRIG } from './triggerTemplates';
import { DataTargetTemplates as TAR } from '../target';
import { DataEffectTemplates } from '../effects';
import { cards } from '@/data';
import { DataUnitFilters } from '../effects/unitFilters';

export const DataAbilityTemplates: {
  [key: string]: ({ ...any }) => Ability;
} = {
  counters: ({ counterType, counterValue, range = DataUnitFilters.self(), trigger }) => {
    return {
      text: `Add ${counterValue} ${counterType} counters ${trigger.type}. ${range.name ? 'Affects ' + range.name + '.' : ''}`,
      icon: '○',
      trigger: trigger,
      effect: DataEffectTemplates.addCounters({
        counterType,
        counterValue,
        range,
      }),
    };
  },
  cleave: ({ damage }) => {
    return {
      text: 'Cleave ' + damage,
      icon: '⚟',
      trigger: TRIG.meAttack,
      effect: ({ triggerParams }) => {
        DataUnitFilters.adjacentAllies()
          .fn(triggerParams.defender)
          .forEach((u: UnitDeployed) => {
            damageUnit(u, damage);
          });
      },
    };
  },
  ping: ({ damage, targetCount = 1 }) => {
    return {
      text: 'Ping ' + damage,
      trigger: TRIG.activated,
      targets: [TAR.ennemies(targetCount)],
      effect: ({ targets }) => {
        (targets[0] as UnitDeployed[]).forEach((u) => {
          damageUnit(u, damage);
        });
      },
    };
  },
  cc: ({ duration, targetCount = 1, statusType = StatusType.Mezz }) => {
    return {
      text: statusType + ' ' + targetCount + ' unit for ' + duration + ' turns',
      trigger: TRIG.activated,
      exhausts: true,
      targets: [TAR.ennemies(targetCount)],
      effect: ({ unit, targets }) => {
        (targets[0] as UnitDeployed[]).forEach((u: UnitDeployed) => {
          applyUnitStatus(u, statusType, duration);
        });
      },
    };
  },
  stun: ({ duration, targetCount = 1 }) => {
    return {
      text: 'Stun ' + duration,
      trigger: TRIG.activated,
      targets: [TAR.ennemies(targetCount)],
      effect: ({ targets }) => {
        (targets[0] as UnitDeployed[]).forEach((u: UnitDeployed) => {
          applyUnitStatus(u, StatusType.Stun, duration);
        });
      },
    };
  },
  root: ({ duration, targetCount = 1 }) => {
    return {
      text: 'Root ' + duration,
      trigger: TRIG.activated,
      targets: [TAR.ennemies(targetCount)],
      effect: ({ targets }) => {
        (targets[0] as UnitDeployed[]).forEach((u: UnitDeployed) => {
          applyUnitStatus(u, StatusType.Root, duration);
        });
      },
    };
  },
  healAdjacentOnMove: ({ healValue }) => {
    return {
      text: 'Heal adjacent allies on move by ' + healValue,
      icon: '♡',
      trigger: TRIG.meMove,
      effect: ({ triggerParams }) => {
        DataUnitFilters.adjacentAllies()
          .fn(triggerParams.mover)
          .forEach((u: UnitDeployed) => {
            healUnit(u, healValue);
          });
      },
    };
  },
  buffAdjacentOnMove: ({ attackValue }) => {
    return {
      text: 'Buff adjacent allies on move by ' + attackValue,
      trigger: TRIG.meMove,
      effect: DataEffectTemplates.buffAdjAlliesTemp({ power: attackValue }),
    };
  },
  summon: ({ summonedUnit, cost }) => {
    return {
      text: 'Summon ' + summonedUnit,
      cost: cost,
      trigger: TRIG.activated,
      targets: [TAR.allyCell()],
      exhausts: true,
      effect: ({ unit, targets }) => {
        console.log('summon', unit, targets);
        (targets[0] as Position[]).forEach((cell: Position) => {
          const createdUnit = makeUnit(unit.ownerPlayerId, cards[summonedUnit] as UnitCardTemplate);
          summonUnit(createdUnit, cell);
        });
      },
    };
  },
  grows: ({ growthValue }) => {
    return {
      text: `Turn start: gains ${growthValue} growth counters`,
      trigger: TRIG.myTurnStarts,
      effect: DataEffectTemplates.addCounters({
        counterType: CounterType.Growth,
        counterValue: growthValue,
      }),
    };
  },
  staticKeyword: ({ keyword }) => {
    return {
      text: `Give ${keyword.key} ${keyword.value} to adjacent allies`,
      trigger: DataTriggerTemplates.static,
      effect: DataEffectTemplates.staticKeywordAdjAllies({
        name: keyword.key,
        keyword,
      }),
    };
  },
};
