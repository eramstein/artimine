import { TriggerType } from '@/lib/_model/enums';
import type { Trigger, UnitDeployed } from '@/lib/_model/model-battle';

// Define specific trigger definitions for better type safety
type TriggerTemplateFunctions = {
  static: Trigger;
  activated: Trigger;
  meAttack: Trigger;
  meMove: Trigger;
  meDeployed: Trigger;
  myTurnStarts: Trigger;
  meDies: Trigger;
  allyDies: Trigger;
};

export const DataTriggerTemplates: TriggerTemplateFunctions = {
  static: {
    type: TriggerType.Static,
  },
  activated: {
    type: TriggerType.Activated,
  },
  meAttack: {
    type: TriggerType.AfterCombat,
    condition: (unit: UnitDeployed, triggerParams: any) =>
      unit.instanceId === triggerParams.attacker.instanceId,
  },
  meMove: {
    type: TriggerType.AfterMove,
    condition: (unit: UnitDeployed, triggerParams: any) =>
      unit.instanceId === triggerParams.mover.instanceId,
  },
  meDeployed: {
    type: TriggerType.OnDeploy,
    condition: (unit: UnitDeployed, triggerParams: any) =>
      unit.instanceId === triggerParams.unit.instanceId,
  },
  meDies: {
    type: TriggerType.OnDeath,
    condition: (unit: UnitDeployed, triggerParams: any) => {
      return unit.instanceId === triggerParams.unit.instanceId;
    },
  },
  allyDies: {
    type: TriggerType.OnDeath,
    condition: (unit: UnitDeployed, triggerParams: any) => {
      return unit.ownerPlayerId === triggerParams.unit.ownerPlayerId;
    },
    text: 'when an ally dies',
  },
  myTurnStarts: {
    type: TriggerType.OnTurnStart,
    condition: (unit: UnitDeployed, triggerParams: any) =>
      unit.ownerPlayerId === triggerParams.player.id,
  },
};
