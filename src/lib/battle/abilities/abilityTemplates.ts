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
      actions: [
        {
          text: `Add ${counterValue} ${counterType} counters ${trigger.text || trigger.type}. ${range.name && range.name !== 'self' ? 'Affects ' + range.name + '.' : ''}`,
          effect: DataEffectTemplates.addCounters({
            counterType,
            counterValue,
            range,
          }),
        },
      ],
      icon: '○',
      trigger: trigger,
    };
  },
  cleave: ({ damage }) => {
    return {
      actions: [
        {
          text: 'Cleave ' + damage,
          effect: ({ triggerParams }) => {
            DataUnitFilters.adjacentAllies()
              .fn(triggerParams.defender)
              .forEach((u: UnitDeployed) => {
                damageUnit(u, damage);
              });
          },
        },
      ],
      icon: '⚟',
      trigger: TRIG.meAttack,
    };
  },
  ping: ({ damage, targetCount = 1 }) => {
    return {
      actions: [
        {
          text: 'Ping ' + damage,
          targets: [TAR.ennemies(targetCount)],
          effect: ({ targets }) => {
            (targets[0] as UnitDeployed[]).forEach((u) => {
              damageUnit(u, damage);
            });
          },
        },
      ],
      trigger: TRIG.activated,
      exhausts: true,
    };
  },
  cc: ({ duration, targetCount = 1, statusType = StatusType.Mezz }) => {
    return {
      actions: [
        {
          text: statusType + ' ' + targetCount + ' unit for ' + duration + ' turns',
          targets: [TAR.ennemies(targetCount)],
          effect: ({ unit, targets }) => {
            (targets[0] as UnitDeployed[]).forEach((u: UnitDeployed) => {
              applyUnitStatus(u, statusType, duration);
            });
          },
        },
      ],
      trigger: TRIG.activated,
      exhausts: true,
    };
  },
  stun: ({ duration, targetCount = 1 }) => {
    return {
      actions: [
        {
          text: 'Stun ' + duration,
          targets: [TAR.ennemies(targetCount)],
          effect: ({ targets }) => {
            (targets[0] as UnitDeployed[]).forEach((u: UnitDeployed) => {
              applyUnitStatus(u, StatusType.Stun, duration);
            });
          },
        },
      ],
      trigger: TRIG.activated,
    };
  },
  root: ({ duration, targetCount = 1 }) => {
    return {
      actions: [
        {
          text: 'Root ' + duration,
          targets: [TAR.ennemies(targetCount)],
          effect: ({ targets }) => {
            (targets[0] as UnitDeployed[]).forEach((u: UnitDeployed) => {
              applyUnitStatus(u, StatusType.Root, duration);
            });
          },
        },
      ],
      trigger: TRIG.activated,
    };
  },
  healAdjacentOnMove: ({ healValue }) => {
    return {
      actions: [
        {
          text: 'Heal adjacent allies on move by ' + healValue,
          effect: ({ triggerParams }) => {
            DataUnitFilters.adjacentAllies()
              .fn(triggerParams.mover)
              .forEach((u: UnitDeployed) => {
                healUnit(u, healValue);
              });
          },
        },
      ],
      icon: '♡',
      trigger: TRIG.meMove,
    };
  },
  buffAdjacentOnMove: ({ attackValue }) => {
    return {
      actions: [
        {
          text: 'Buff adjacent allies on move by ' + attackValue,
          effect: DataEffectTemplates.buffAdjAlliesTemp({ power: attackValue }),
        },
      ],
      trigger: TRIG.meMove,
    };
  },
  summon: ({ summonedUnit, cost }) => {
    return {
      actions: [
        {
          text: 'Summon ' + summonedUnit.name,
          targets: [TAR.allyCell()],
          effect: ({ unit, targets }) => {
            console.log('summon', unit, targets);
            (targets[0] as Position[]).forEach((cell: Position) => {
              const createdUnit = makeUnit(
                unit.ownerPlayerId,
                cards[summonedUnit] as UnitCardTemplate
              );
              summonUnit(createdUnit, cell);
            });
          },
        },
      ],
      cost: cost,
      trigger: TRIG.activated,
      exhausts: true,
    };
  },
  respawnAs: ({ summonedUnit }) => {
    return {
      actions: [
        {
          text: 'When this unit dies, put a ' + summonedUnit.name + ' in its place',
          effect: ({ unit }) => {
            console.log('respawnAs', unit, summonedUnit);
            const createdUnit = makeUnit(
              unit.ownerPlayerId,
              cards[summonedUnit] as UnitCardTemplate
            );
            summonUnit(createdUnit, unit.position);
          },
        },
      ],
      trigger: TRIG.meDies,
    };
  },
  grows: ({ growthValue }) => {
    return {
      actions: [
        {
          text: `Turn start: gains ${growthValue} growth counters`,
          effect: DataEffectTemplates.addCounters({
            counterType: CounterType.Growth,
            counterValue: growthValue,
          }),
        },
      ],
      trigger: TRIG.myTurnStarts,
    };
  },
  staticKeyword: ({ keyword }) => {
    return {
      actions: [
        {
          text: `Give ${keyword.key} ${keyword.value} to adjacent allies`,
          effect: DataEffectTemplates.staticKeywordAdjAllies({
            name: keyword.key,
            keyword,
          }),
        },
      ],
      trigger: DataTriggerTemplates.static,
    };
  },
};
