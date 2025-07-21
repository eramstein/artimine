import {
  damageUnit,
  healUnit,
  getAdjacentAllies,
  applyUnitStatus,
  summonUnit,
  makeUnit,
} from '@/lib/battle';
import {
  type Target,
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

interface AbilityParams {
  name: string;
  cost?: number;
  target?: Target;
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
        getAdjacentAllies(triggerParams.defender).forEach((u) => {
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
      target: TAR.ennemies(targetCount),
      effect: ({ targets }) => {
        (targets as UnitDeployed[]).forEach((u) => {
          damageUnit(u, damage);
        });
      },
      ...p,
    };
  },
  mezz: (p, { duration, targetCount = 1 }) => {
    return {
      text: 'Mezz ' + targetCount + ' unit for ' + duration + ' turns',
      trigger: TRIG.activated,
      target: TAR.ennemies(targetCount),
      effect: ({ targets }) => {
        (targets as UnitDeployed[]).forEach((u) => {
          applyUnitStatus(u, StatusType.Mezz, duration);
        });
      },
      ...p,
    };
  },
  stun: (p, { duration, targetCount = 1 }) => {
    return {
      text: 'Stun ' + duration,
      trigger: TRIG.activated,
      target: TAR.ennemies(targetCount),
      effect: ({ targets }) => {
        (targets as UnitDeployed[]).forEach((u) => {
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
      target: TAR.ennemies(targetCount),
      effect: ({ targets }) => {
        (targets as UnitDeployed[]).forEach((u) => {
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
        getAdjacentAllies(triggerParams.mover).forEach((u) => {
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
      effect: DataEffectTemplates.buffAdjAlliesTemp({ attack: attackValue }),
      ...p,
    };
  },
  summon: (p, { summonedUnit }) => {
    return {
      text: 'Summon ' + summonedUnit,
      trigger: TRIG.activated,
      target: TAR.allyCell(),
      effect: ({ unit, targets }) => {
        (targets as Position[]).forEach((cell) => {
          const createdUnit = makeUnit(unit.ownerPlayerId, cards[summonedUnit] as UnitCardTemplate);
          summonUnit(createdUnit, cell);
        });
      },
      ...p,
    };
  },
  grows: (p, { growthValue }) => {
    return {
      text: `Turn start: gains +${growthValue}/+${growthValue}`,
      trigger: TRIG.myTurnStarts,
      effect: DataEffectTemplates.grow({ growthValue }),
      ...p,
    };
  },
};
