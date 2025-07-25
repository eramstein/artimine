import { CardColor, CardType, type CardTemplate } from '@/lib/_model';
import { DataAbilityTemplates, DataTriggerTemplates, SpellTemplates } from '@/lib/battle/abilities';
import { DataEffectTemplates } from '@/lib/battle/effects';
import { DataTargetTemplates } from '@/lib/battle/target';

export const cards_R: Record<string, CardTemplate> = {
  lightning_bolt: {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    text: 'Deal 3 damage to a unit',
    type: CardType.Spell,
    cost: 1,
    colors: [{ color: CardColor.Red, count: 1 }],
    ...SpellTemplates.dd({ damage: 3 }),
  },
  dwarf_berserker: {
    id: 'dwarf_berserker',
    name: 'Dwarf Berserker',
    type: CardType.Unit,
    cost: 3,
    power: 2,
    maxHealth: 2,
    colors: [{ color: CardColor.Red, count: 3 }],
    keywords: {
      haste: true,
    },
  },
  modis_chosen: {
    id: 'modis_chosen',
    name: 'Chosen of Modi',
    type: CardType.Unit,
    cost: 4,
    power: 4,
    maxHealth: 2,
    colors: [
      { color: CardColor.Red, count: 2 },
      { color: CardColor.Green, count: 1 },
    ],
    keywords: {
      zerk: true,
      haste: true,
    },
  },
};
