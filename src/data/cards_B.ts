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

export const cards_B: Record<string, CardTemplate> = {
  raise_dead: {
    id: 'raise_dead',
    name: 'Raise Dead',
    rarity: CardRarity.Common,
    type: CardType.Spell,
    cost: 2,
    colors: [{ color: CardColor.Black, count: 1 }],
    actions: [
      {
        effect: {
          name: 'reanimate',
          args: {},
        },
        targets: [{ type: TargetType.GraveyardCard }, { type: TargetType.Cell }],
      },
    ],
  },
  decaying_ray: {
    id: 'decaying_ray',
    name: 'Decaying Ray',
    rarity: CardRarity.Common,
    type: CardType.Spell,
    cost: 4,
    colors: [{ color: CardColor.Black, count: 2 }],
    actions: [
      {
        effect: {
          name: 'addCounters',
          args: {
            counterType: CounterType.Decay,
            counterValue: 2,
            range: { sameRow: true },
          },
        },
        targets: [{ type: TargetType.Units, count: 1 }],
      },
    ],
  },
  guinea_pig: {
    id: 'guinea_pig',
    name: 'Guinea Pig',
    rarity: CardRarity.Common,
    type: CardType.Spell,
    cost: 1,
    colors: [{ color: CardColor.Black, count: 1 }],
    actions: [
      {
        targets: [{ type: TargetType.Units, count: 1 }],
        effect: {
          name: 'transferCounters',
          args: {
            counterType: CounterType.Decay,
          },
        },
      },
    ],
  },
  mosquito: {
    id: 'mosquito',
    name: 'Mosquito',
    rarity: CardRarity.Common,
    type: CardType.Unit,
    cost: 3,
    power: 0,
    maxHealth: 1,
    colors: [{ color: CardColor.Black, count: 2 }],
    abilities: [
      {
        actions: [
          {
            effect: {
              name: 'addCounters',
              args: {
                counterType: CounterType.Decay,
                counterValue: 1,
                range: { sameRow: true, ennemies: true },
              },
            },
          },
        ],
        trigger: { type: TriggerType.AfterMove, range: TriggerRange.Self },
      },
    ],
  },
  zombie: {
    id: 'zombie',
    name: 'Zombie',
    rarity: CardRarity.Common,
    type: CardType.Unit,
    cost: 2,
    power: 2,
    maxHealth: 2,
    colors: [{ color: CardColor.Black, count: 1 }],
  },
  grim_guard: {
    id: 'grim_guard',
    name: 'Grim Guard',
    rarity: CardRarity.Common,
    type: CardType.Unit,
    cost: 3,
    power: 2,
    maxHealth: 3,
    colors: [{ color: CardColor.Black, count: 1 }],
    keywords: {
      ranged: true,
    },
  },
  dark_ritual: {
    id: 'dark_ritual',
    name: 'Dark Ritual',
    rarity: CardRarity.Common,
    type: CardType.Spell,
    cost: 2,
    colors: [{ color: CardColor.Black, count: 1 }],
    actions: [
      {
        targets: [
          { type: TargetType.Allies, count: 1 },
          { type: TargetType.Units, count: 1 },
        ],
        effect: {
          name: 'darkRitual',
          args: {},
        },
      },
    ],
  },
};
