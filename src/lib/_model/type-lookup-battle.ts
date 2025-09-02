import { CardType } from './enums';
import type {
  Card,
  CardTemplate,
  EffectTargets,
  Land,
  Player,
  Position,
  SpellCardTemplate,
  UnitCardTemplate,
  UnitDeployed,
} from './model-battle';

export function isUnitCard(card: CardTemplate): card is UnitCardTemplate {
  return card.type === CardType.Unit;
}
export function isSpellCard(card: CardTemplate): card is SpellCardTemplate {
  return card.type === CardType.Spell;
}
export function isAttackingLand(target: UnitDeployed | Land | Player): target is Land {
  return 'position' in target && 'health' in target;
}
export function isAttackingPlayer(target: UnitDeployed | Land | Player): target is Player {
  return 'life' in target && 'mana' in target && 'isPlayer' in target;
}
export function isAttackingUnitDeployed(
  target: UnitDeployed | Land | Player
): target is UnitDeployed {
  return 'hasAttacked' in target;
}
export function isDeployedUnit(target: EffectTargets): target is UnitDeployed[] {
  return target.length > 0 && 'hasAttacked' in target[0];
}
export function isPosition(target: EffectTargets): target is Position[] {
  return target.length > 0 && 'row' in target[0];
}
export function isCard(target: EffectTargets): target is Card[] {
  return target.length > 0 && 'instanceId' in target[0] && !('position' in target[0]);
}
export function isLand(target: EffectTargets): target is Land[] {
  return target.length > 0 && 'position' in target[0] && typeof target[0].position === 'number';
}
