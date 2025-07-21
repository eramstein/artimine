import { CardColor, CardType, type CardTemplate } from '@/lib/_model';
import { DataAbilityTemplates, DataTriggerTemplates } from '@/lib/battle/abilities';
import { DataEffectTemplates } from '@/lib/battle/effects';
import { DataTargetTemplates } from '@/lib/battle/target';

export const cards_R: Record<string, CardTemplate> = {
  lightningBolt: {
    id: 'lightningBolt',
    name: 'Lightning Bolt',
    text: 'Deal 3 damage to a unit',
    type: CardType.Spell,
    cost: 1,
    colors: [{ color: CardColor.Red, count: 2 }],
    effect: DataEffectTemplates.damageUnit({ damage: 3 }),
    target: DataTargetTemplates.unit(),
  },
  dwarfBerserker: {
    id: 'dwarfBerserker',
    name: 'Dwarf Berserker',
    type: CardType.Unit,
    cost: 3,
    power: 3,
    maxHealth: 2,
    colors: [{ color: CardColor.Red, count: 3 }],
    keywords: {
      haste: true,
    },
  },
};
