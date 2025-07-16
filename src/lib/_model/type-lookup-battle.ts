import { CardType } from './enums';
import type {
  CardTemplate,
  SpellCardTemplate,
  UnitCardTemplate,
  UnitDeployed,
  Land,
  Player,
} from './model-battle';

export function isUnitCard(card: CardTemplate): card is UnitCardTemplate {
  return card.type === CardType.Unit;
}
export function isSpellCard(card: CardTemplate): card is SpellCardTemplate {
  return card.type === CardType.Spell;
}
export function isLand(target: UnitDeployed[] | Land | Player): target is Land {
  return 'position' in target && 'health' in target;
}
export function isPlayer(target: UnitDeployed[] | Land | Player): target is Player {
  return 'life' in target && 'mana' in target && 'isPlayer' in target;
}
