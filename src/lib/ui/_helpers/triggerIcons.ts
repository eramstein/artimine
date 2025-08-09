import { TriggerType } from '../../_model/enums';

export const TRIGGER_ICONS: Record<TriggerType, string> = {
  [TriggerType.Static]: '⚡', // Lightning bolt for static effects
  [TriggerType.Activated]: '⚔️', // Crossed swords for activated abilities
  [TriggerType.BeforeDamage]: '🛡️', // Shield for defensive triggers
  [TriggerType.AfterCombat]: '⚔️', // Crossed swords for combat-related
  [TriggerType.AfterMove]: '👣', // Footprints for movement
  [TriggerType.BeforeMove]: '🚫', // Prohibited sign for blocking movement
  [TriggerType.OnDeath]: '💀', // Skull for death triggers
  [TriggerType.OnDeploy]: '📦', // Package for deployment
  [TriggerType.OnTurnStart]: '🔄', // Circular arrows for turn-based triggers
};
