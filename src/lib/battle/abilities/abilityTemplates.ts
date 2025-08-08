import {
  type Ability,
  StatusType,
  CounterType,
  TargetType,
  TriggerType,
  TriggerRange,
} from '@/lib/_model';
import { getRangeLabel } from '../effects/unitFilters';

export const DataAbilityTemplates: {
  [key: string]: ({ ...any }) => Ability;
} = {
  counters: ({ counterType, counterValue, range, trigger }) => ({
    actions: [
      {
        text: `Add ${counterValue} ${counterType} counters ${trigger.text || trigger.type}. ${range ? 'Affects ' + getRangeLabel(range) : ''}`,
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
    trigger: { type: TriggerType.Activated },
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
    trigger: { type: TriggerType.Activated },
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
    trigger: { type: TriggerType.Activated },
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
    trigger: { type: TriggerType.OnDeath, range: TriggerRange.Self },
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
    trigger: { type: TriggerType.OnTurnStart, range: TriggerRange.Self },
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
    trigger: { type: TriggerType.Static },
  }),
};
