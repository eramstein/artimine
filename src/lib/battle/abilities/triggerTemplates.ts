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
      console.log('meDies', unit, triggerParams);
      return unit.instanceId === triggerParams.unit.instanceId;
    },
  },
  myTurnStarts: {
    type: TriggerType.OnTurnStart,
    condition: (unit: UnitDeployed, triggerParams: any) =>
      unit.ownerPlayerId === triggerParams.player.id,
  },
};
