import { CardColor, CardRarity, CardType, CounterType, type CardTemplate } from '@/lib/_model';
import { DataAbilityTemplates, DataTriggerTemplates } from '@/lib/battle/abilities';
import { DataEffectTemplates, DataUnitFilters } from '@/lib/battle/effects';
import { DataTargetTemplates } from '@/lib/battle/target';

export const cards_R: Record<string, CardTemplate> = {
  lightning_bolt: {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    rarity: CardRarity.Common,
    type: CardType.Spell,
    cost: 1,
    colors: [{ color: CardColor.Red, count: 1 }],
    actions: [
      {
        effect: DataEffectTemplates.damageUnit({ damage: 3 }),
        targets: [DataTargetTemplates.units(1)],
        text: `Deal 3 damage to a unit`,
      },
      {
        effect: DataEffectTemplates.damageUnit({ damage: 2 }),
        targets: [DataTargetTemplates.units(2)],
        text: `Deal 2 damage to 2 units`,
      },
    ],
  },
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    rarity: CardRarity.Common,
    type: CardType.Spell,
    cost: 5,
    colors: [{ color: CardColor.Red, count: 2 }],
    actions: [
      {
        effect: DataEffectTemplates.damageUnit({
          damage: 1,
          range: DataUnitFilters.targetAndAdjacentUnits(),
        }),
        targets: [DataTargetTemplates.units(1)],
        text: `Deal 1 damage to a unit and adjacent units`,
      },
    ],
  },
  dwarf_berserker: {
    id: 'dwarf_berserker',
    name: 'Dwarf Berserker',
    rarity: CardRarity.Common,
    type: CardType.Unit,
    cost: 3,
    power: 2,
    maxHealth: 2,
    colors: [{ color: CardColor.Red, count: 3 }],
    keywords: {
      haste: true,
    },
  },
  tim: {
    id: 'tim',
    name: 'Tim',
    rarity: CardRarity.Common,
    type: CardType.Unit,
    cost: 4,
    power: 1,
    maxHealth: 1,
    colors: [{ color: CardColor.Red, count: 1 }],
    abilities: [DataAbilityTemplates.ping({ damage: 1 })],
  },
  frenzied_shaman: {
    id: 'frenzied_shaman',
    name: 'Frenzied Shaman',
    rarity: CardRarity.Common,
    type: CardType.Unit,
    cost: 5,
    power: 2,
    maxHealth: 4,
    colors: [{ color: CardColor.Red, count: 2 }],
    abilities: [
      DataAbilityTemplates.counters({
        counterType: CounterType.Rage,
        counterValue: 1,
        trigger: DataTriggerTemplates.allyDies,
      }),
    ],
  },
  modis_chosen: {
    id: 'modis_chosen',
    name: 'Chosen of Modi',
    rarity: CardRarity.Common,
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
