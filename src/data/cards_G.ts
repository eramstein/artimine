import {
  CardColor,
  CardType,
  CounterType,
  StatusType,
  UnitType,
  type CardTemplate,
} from '@/lib/_model';
import { DataAbilityTemplates, DataTriggerTemplates } from '@/lib/battle/abilities';
import { DataEffectTemplates, DataUnitFilters } from '@/lib/battle/effects';
import { DataTargetTemplates } from '@/lib/battle/target';
import { incrementColor, untapPlayer } from '@/lib/battle/player';

export const cards_G: Record<string, CardTemplate> = {
  wall_of_bramble: {
    id: 'wall_of_bramble',
    name: 'Wall of Bramble',
    type: CardType.Unit,
    cost: 2,
    power: 1,
    maxHealth: 3,
    colors: [{ color: CardColor.Green, count: 1 }],
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
  },
  dryad: {
    id: 'dryad',
    name: 'Dryad',
    type: CardType.Unit,
    cost: 3,
    power: 2,
    maxHealth: 4,
    colors: [{ color: CardColor.Green, count: 2 }],
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
    abilities: [DataAbilityTemplates.grows({ growthValue: 1 })],
  },
  shroomy_shooty: {
    id: 'shroomy_shooty',
    name: 'Shroomy Shooty',
    type: CardType.Unit,
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
    unitTypes: [UnitType.Mushroom],
    cost: 1,
    power: 0,
    maxHealth: 1,
    colors: [{ color: CardColor.Green, count: 1 }],
    abilities: [DataAbilityTemplates.cc({ duration: 1, statusType: StatusType.Root })],
  },
  shroomy_protecs: {
    id: 'shroomy_protecs',
    name: 'Shroomy Protecs',
    type: CardType.Unit,
    unitTypes: [UnitType.Mushroom],
    cost: 1,
    power: 0,
    maxHealth: 1,
    colors: [{ color: CardColor.Green, count: 1 }],
    abilities: [DataAbilityTemplates.staticKeyword({ keyword: { key: 'resist', value: 1 } })],
  },
  lord_of_shrooms: {
    id: 'lord_of_shrooms',
    name: 'Lord of Shrooms',
    type: CardType.Unit,
    unitTypes: [UnitType.Mushroom],
    cost: 3,
    power: 1,
    maxHealth: 1,
    colors: [{ color: CardColor.Green, count: 2 }],
    abilities: [
      DataAbilityTemplates.counters({
        counterType: CounterType.Growth,
        counterValue: 1,
        range: DataUnitFilters.alliedOfType(UnitType.Mushroom),
        trigger: DataTriggerTemplates.meDeployed,
      }),
    ],
  },
  luxurious_growth: {
    id: 'luxurious_growth',
    name: 'Luxurious Growth',
    type: CardType.Spell,
    cost: 1,
    colors: [{ color: CardColor.Green, count: 1 }],
    effects: [
      {
        effect: (p) => {
          incrementColor(p.player, CardColor.Green, 1);
        },
        text: `Gain 1 Green mana`,
      },
    ],
  },
  energyze: {
    id: 'energyze',
    name: 'Energyze',
    type: CardType.Spell,
    cost: 3,
    colors: [{ color: CardColor.Green, count: 2 }],
    effects: [
      {
        effect: (p) => {
          untapPlayer(p.player);
        },
        text: 'Untap your hero ability',
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
  },
  deep_forest_wurm: {
    id: 'deep_forest_wurm',
    name: 'Deep Forest Wurm',
    type: CardType.Unit,
    cost: 6,
    power: 6,
    maxHealth: 6,
    colors: [{ color: CardColor.Green, count: 1 }],
    keywords: {
      trample: true,
    },
  },
};
