import { TriggerType } from '@/lib/_model/enums';
import type { Trigger } from '@/lib/_model/model-battle';

export const DataTriggerTemplates: {
  [key: string]: Trigger;
} = {
  static: {
    type: TriggerType.Static,
  },
  activated: {
    type: TriggerType.Activated,
  },
  meAttack: {
    type: TriggerType.AfterCombat,
    condition: (unit, triggerParams) => unit.instanceId === triggerParams.attacker.instanceId,
  },
  meMove: {
    type: TriggerType.AfterMove,
    condition: (unit, triggerParams) => unit.instanceId === triggerParams.mover.instanceId,
  },
  myTurnStarts: {
    type: TriggerType.OnTurnStart,
    condition: (unit, triggerParams) => unit.ownerPlayerId === triggerParams.playerId,
  },
};
