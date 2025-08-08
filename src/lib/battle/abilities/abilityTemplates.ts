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
  TargetType,
} from '@/lib/_model';
import { DataTriggerTemplates as TRIG } from './triggerTemplates';
import { DataUnitFilters } from '../effects/unitFilters';

export const DataAbilityTemplates: {
  [key: string]: ({ ...any }) => Ability;
} = {
  counters: ({ counterType, counterValue, range = DataUnitFilters.self(), trigger }) => ({
    actions: [
      {
        text: `Add ${counterValue} ${counterType} counters ${trigger.text || trigger.type}. ${range.name && range.name !== 'self' ? 'Affects ' + range.name + '.' : ''}`,
        effect: {
          name: 'addCounters',
          args: {
            counterType,
            counterValue,
            range,
          },
        },
      },
    ],
    icon: '○',
    trigger: trigger,
  }),
  ping: ({ damage, targetCount = 1 }) => ({
    actions: [
      {
        text: 'Ping ' + damage,
        targets: [{ type: TargetType.Ennemies, count: targetCount }],
        effect: {
          name: 'damageUnit',
          args: {
            damage,
          },
        },
      },
    ],
    trigger: TRIG.activated,
    exhausts: true,
  }),
  cc: ({ duration, targetCount = 1, statusType = StatusType.Mezz }) => ({
    actions: [
      {
        text: statusType + ' ' + targetCount + ' unit for ' + duration + ' turns',
        targets: [{ type: TargetType.Ennemies, count: targetCount }],
        effect: {
          name: 'applyUnitStatus',
          args: {
            statusType,
            duration,
          },
        },
      },
    ],
    trigger: TRIG.activated,
    exhausts: true,
  }),
  summon: ({ summonedUnit, cost }) => ({
    actions: [
      {
        text: 'Summon ' + summonedUnit.name,
        targets: [{ type: TargetType.AllyCell }],
        effect: {
          name: 'summon',
          args: {
            summonedUnit,
          },
        },
      },
    ],
    cost: cost,
    trigger: TRIG.activated,
    exhausts: true,
  }),
  respawnAs: ({ summonedUnit }) => ({
    actions: [
      {
        text: 'When this unit dies, put a ' + summonedUnit.name + ' in its place',
        effect: {
          name: 'summon',
          args: {
            summonedUnit,
            isRespawn: true,
          },
        },
      },
    ],
    trigger: TRIG.meDies,
  }),
  grows: ({ growthValue }) => ({
    actions: [
      {
        text: `Turn start: gains ${growthValue} growth counters`,
        effect: {
          name: 'addCounters',
          args: {
            counterType: CounterType.Growth,
            counterValue: growthValue,
          },
        },
      },
    ],
    trigger: TRIG.myTurnStarts,
  }),
  staticKeyword: ({ keyword }) => ({
    actions: [
      {
        text: `Give ${keyword.key} ${keyword.value} to adjacent allies`,
        effect: {
          name: 'staticKeywordAdjAllies',
          args: {
            name: keyword.key,
            keyword,
          },
        },
      },
    ],
    trigger: DataTriggerTemplates.static,
  }),
};
