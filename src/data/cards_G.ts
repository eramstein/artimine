import {
  CardColor,
  CardRarity,
  CardType,
  CounterType,
  StatusType,
  TargetType,
  TriggerRange,
  TriggerType,
  UnitType,
  type CardTemplate,
} from '@/lib/_model';

export const cards_G: Record<string, CardTemplate> = {
  wall_of_bramble: {
    id: 'wall_of_bramble',
    name: 'Wall of Bramble',
    type: CardType.Unit,
    cost: 2,
    power: 1,
    maxHealth: 3,
    colors: [{ color: CardColor.Green, count: 1 }],
    rarity: CardRarity.Common,
    keywords: {
      retaliate: 1,
    },
  },
  grizzly_bear: {
    id: 'grizzly_bear',
    name: 'Grizzly Bear',
    type: CardType.Unit,
    cost: 2,
    power: 2,
    maxHealth: 3,
    colors: [{ color: CardColor.Green, count: 2 }],
    rarity: CardRarity.Common,
  },
  dryad: {
    id: 'dryad',
    name: 'Dryad',
    type: CardType.Unit,
    cost: 3,
    power: 2,
    maxHealth: 4,
    colors: [{ color: CardColor.Green, count: 2 }],
    rarity: CardRarity.Common,
    keywords: {
      regeneration: 1,
    },
  },
  snek: {
    id: 'snek',
    name: 'Venomous Snake',
    type: CardType.Unit,
    cost: 3,
    power: 3,
    maxHealth: 4,
    colors: [{ color: CardColor.Green, count: 3 }],
    rarity: CardRarity.Common,
    keywords: {
      poisonous: 1,
    },
  },
  young_ent: {
    id: 'young_ent',
    name: 'Young Treeman',
    type: CardType.Unit,
    cost: 4,
    power: 2,
    maxHealth: 4,
    colors: [{ color: CardColor.Green, count: 3 }],
    rarity: CardRarity.Common,
    keywords: {
      retaliate: 1,
      armor: 1,
    },
  },
  shroomy: {
    id: 'shroomy',
    name: 'Shroomy',
    type: CardType.Unit,
    unitTypes: [UnitType.Mushroom],
    cost: 1,
    power: 1,
    maxHealth: 1,
    colors: [{ color: CardColor.Green, count: 3 }],
    rarity: CardRarity.Common,
    abilities: [
      {
        actions: [
          {
            effect: {
              name: 'addCounters',
              args: {
                counterType: CounterType.Growth,
                counterValue: 1,
              },
            },
          },
        ],
        trigger: { type: TriggerType.OnTurnStart, range: TriggerRange.Self },
      },
    ],
  },
  shroomy_shooty: {
    id: 'shroomy_shooty',
    name: 'Shroomy Shooty',
    type: CardType.Unit,
    rarity: CardRarity.Common,
    unitTypes: [UnitType.Mushroom],
    cost: 1,
    power: 1,
    maxHealth: 1,
    colors: [{ color: CardColor.Green, count: 1 }],
    keywords: { ranged: true },
  },
  shroomy_rooty: {
    id: 'shroomy_rooty',
    name: 'Shroomy Rooty',
    type: CardType.Unit,
    rarity: CardRarity.Common,
    unitTypes: [UnitType.Mushroom],
    cost: 1,
    power: 0,
    maxHealth: 1,
    colors: [{ color: CardColor.Green, count: 1 }],
    abilities: [
      {
        actions: [
          {
            targets: [{ type: TargetType.Ennemies, count: 1 }],
            effect: {
              name: 'applyUnitStatus',
              args: {
                statusType: StatusType.Root,
                duration: 1,
              },
            },
          },
        ],
        trigger: { type: TriggerType.Activated },
        exhausts: true,
      },
    ],
  },
  shroomy_protecs: {
    id: 'shroomy_protecs',
    name: 'Shroomy Protecs',
    type: CardType.Unit,
    rarity: CardRarity.Common,
    unitTypes: [UnitType.Mushroom],
    cost: 1,
    power: 0,
    maxHealth: 1,
    colors: [{ color: CardColor.Green, count: 1 }],
    abilities: [
      {
        actions: [
          {
            effect: {
              name: 'staticKeywordAdjAllies',
              args: {
                name: 'shroomy_protecs resist',
                keyword: { key: 'resist', value: 1 },
              },
            },
          },
        ],
        trigger: { type: TriggerType.Static },
      },
    ],
  },
  lord_of_shrooms: {
    id: 'lord_of_shrooms',
    name: 'Lord of Shrooms',
    type: CardType.Unit,
    rarity: CardRarity.Common,
    unitTypes: [UnitType.Mushroom],
    cost: 3,
    power: 1,
    maxHealth: 1,
    colors: [{ color: CardColor.Green, count: 2 }],
    abilities: [
      {
        actions: [
          {
            effect: {
              name: 'addCounters',
              args: {
                counterType: CounterType.Growth,
                counterValue: 1,
                range: { unitType: UnitType.Mushroom, allies: true },
              },
            },
          },
        ],
        trigger: { type: TriggerType.OnDeploy, range: TriggerRange.Self },
      },
    ],
  },
  luxurious_growth: {
    id: 'luxurious_growth',
    name: 'Luxurious Growth',
    type: CardType.Spell,
    rarity: CardRarity.Common,
    cost: 1,
    colors: [{ color: CardColor.Green, count: 1 }],
    actions: [
      {
        effect: {
          name: 'incrementColor',
          args: {
            color: CardColor.Green,
          },
        },
      },
    ],
  },
  energyze: {
    id: 'energyze',
    name: 'Energyze',
    type: CardType.Spell,
    rarity: CardRarity.Common,
    cost: 3,
    colors: [{ color: CardColor.Green, count: 2 }],
    actions: [
      {
        effect: {
          name: 'untapPlayer',
          args: {},
        },
      },
    ],
  },
  basic_wurm: {
    id: 'basic_wurm',
    name: 'Basic Wurm',
    type: CardType.Unit,
    cost: 6,
    power: 6,
    maxHealth: 6,
    colors: [{ color: CardColor.Green, count: 1 }],
    rarity: CardRarity.Common,
  },
  deep_forest_wurm: {
    id: 'deep_forest_wurm',
    name: 'Deep Forest Wurm',
    type: CardType.Unit,
    cost: 6,
    power: 6,
    maxHealth: 6,
    colors: [{ color: CardColor.Green, count: 1 }],
    rarity: CardRarity.Common,
    keywords: {
      trample: true,
    },
  },
};
