import { TriggerType } from '../../_model/enums-battle';

export const TRIGGER_ICONS: Record<TriggerType, string> = {
  [TriggerType.Static]: '/assets/images/keywords/static.png',
  [TriggerType.Activated]: '', // this one is handled separately for tapping icons
  [TriggerType.BeforeDamage]: '/assets/images/keywords/on_damage.png',
  [TriggerType.AfterCombat]: '/assets/images/keywords/on_attack.png',
  [TriggerType.AfterMove]: '/assets/images/keywords/on_move.png',
  [TriggerType.BeforeMove]: '/assets/images/keywords/on_move.png',
  [TriggerType.OnDeath]: '/assets/images/keywords/on_death.png',
  [TriggerType.OnDeploy]: '/assets/images/keywords/on_deploy.png',
  [TriggerType.OnTurnStart]: '/assets/images/keywords/on_turn_start.png',
  [TriggerType.OnReach]: '/assets/images/keywords/on_reach.png',
  [TriggerType.OnCardDrawn]: '/assets/images/keywords/on_draw.png',
};
