import {
  CardColor,
  CardRarity,
  CardType,
  CounterType,
  TargetType,
  TriggerRange,
  TriggerType,
  type CardTemplate,
} from '@/lib/_model';

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
        effect: {
          name: 'damageUnit',
          args: { damage: 3 },
        },
        targets: [{ type: TargetType.Units, count: 1 }],
        text: `Deal 3 damage to a unit`,
      },
      {
        effect: {
          name: 'damageUnit',
          args: { damage: 2 },
        },
        targets: [{ type: TargetType.Units, count: 2 }],
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
        effect: {
          name: 'damageUnit',
          args: {
            damage: 1,
            range: { adjacent: true, self: true },
          },
        },
        targets: [{ type: TargetType.Units, count: 1 }],
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
    abilities: [
      {
        actions: [
          {
            text: 'Ping 1',
            targets: [{ type: TargetType.Ennemies, count: 1 }],
            effect: {
              name: 'damageUnit',
              args: {
                damage: 1,
              },
            },
          },
        ],
        trigger: { type: TriggerType.Activated },
        exhausts: true,
      },
    ],
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
      {
        actions: [
          {
            text: `On allies death: add 1 rage counter to self.`,
            effect: {
              name: 'addCounters',
              args: {
                counterType: CounterType.Rage,
                counterValue: 1,
              },
            },
          },
        ],
        trigger: { type: TriggerType.OnDeath, range: TriggerRange.Allies },
      },
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
