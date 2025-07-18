import { CardColor, CardType, type CardTemplate } from '@/lib/_model';
import {
  DataAbilityTemplates,
  DataEffectTemplates,
  DataTriggerTemplates,
} from '@/lib/battle/abilities';
import { DataTargetTemplates } from '@/lib/battle/abilities/targetTemplates';

export const cards: Record<string, CardTemplate> = {
  lion: {
    id: 'lion',
    name: 'Savannah Lion',
    type: CardType.Unit,
    cost: 2,
    power: 2,
    maxHealth: 5,
    colors: [{ color: CardColor.Red, count: 1 }],
    keywords: {
      ranged: true,
      moveAndAttack: true,
      retaliate: 1,
      armor: 1,
      haste: true,
      poisonous: 2,
      regeneration: 1,
    },
    abilities: [
      {
        name: 'Protect Adjacent',
        text: 'Adjacent units get +1 armor',
        effect: DataEffectTemplates.staticKeywordAdjAllies({
          name: 'ProtectAdjacent1',
          keyword: { key: 'armor', value: 1 },
        }),
        trigger: DataTriggerTemplates.static,
      },
      DataAbilityTemplates.mezz({ name: 'Mezz', cost: 1 }, { duration: 3 }),
    ],
  },
  lightningBolt: {
    id: 'lightningBolt',
    name: 'Lightning Bolt',
    type: CardType.Spell,
    cost: 1,
    colors: [{ color: CardColor.Red, count: 2 }],
    effect: DataEffectTemplates.damageUnit({ damage: 3 }),
    target: DataTargetTemplates.unit(),
  },
};
