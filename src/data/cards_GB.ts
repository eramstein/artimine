import {
  CardColor,
  CardRarity,
  CardType,
  TargetType,
  TriggerRange,
  TriggerType,
  type CardTemplate,
  type UnitCardTemplate,
} from '@/lib/_model';

const shroomy_shooty: UnitCardTemplate = {
  id: 'shroomy_shooty',
  name: 'Shroomy Shooty',
  type: CardType.Unit,
  cost: 1,
  power: 1,
  maxHealth: 1,
  rarity: CardRarity.Common,
  colors: [
    { color: CardColor.Green, count: 1 },
    { color: CardColor.Black, count: 1 },
  ],
};

export const cards_GB: Record<string, CardTemplate> = {
  ebonheart: {
    id: 'ebonheart',
    name: 'Ebonheart',
    rarity: CardRarity.Rare,
    type: CardType.Unit,
    cost: 5,
    power: 0,
    maxHealth: 1,
    colors: [
      { color: CardColor.Green, count: 2 },
      { color: CardColor.Black, count: 1 },
    ],
    abilities: [
      {
        actions: [
          {
            targets: [{ type: TargetType.AllyCell }],
            effect: {
              name: 'summon',
              args: {
                summonedUnit: shroomy_shooty,
              },
            },
          },
        ],
        cost: 1,
        trigger: { type: TriggerType.Activated },
        exhausts: true,
      },
    ],
  },
  mycosed_bear: {
    id: 'mycosed_bear',
    name: 'Mycosed Bear',
    rarity: CardRarity.Common,
    type: CardType.Unit,
    cost: 3,
    power: 2,
    maxHealth: 1,
    colors: [
      { color: CardColor.Green, count: 1 },
      { color: CardColor.Black, count: 1 },
    ],
    abilities: [
      {
        actions: [
          {
            effect: {
              name: 'summon',
              args: {
                summonedUnit: shroomy_shooty,
                isRespawn: true,
              },
            },
          },
        ],
        trigger: { type: TriggerType.OnDeath, range: TriggerRange.Self },
      },
    ],
  },
};
