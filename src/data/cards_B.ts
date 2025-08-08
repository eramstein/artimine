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
import { DataAbilityTemplates } from '@/lib/battle/abilities';
import { DataUnitFilters } from '@/lib/battle/effects';

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
        text: 'Re-animate a unit from a graveyard',
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
            range: DataUnitFilters.inRow(),
          },
        },
        targets: [{ type: TargetType.Units, count: 1 }],
        text: `Add 2 Decay counters to all units in a row`,
      },
    ],
  },
  // guinea_pig: {
  //   id: 'guinea_pig',
  //   name: 'Guinea Pig',
  //   rarity: CardRarity.Common,
  //   type: CardType.Spell,
  //   cost: 1,
  //   colors: [{ color: CardColor.Black, count: 1 }],
  //   actions: [
  //     {
  //       text: 'Move all decay counters to target creature',
  //       targets: [DataTargetTemplates.units(1)],
  //       effect: (p) => {
  //         const unit = p.targets[0][0] as UnitDeployed;
  //         let movedCounters = 0;
  //         bs.units.forEach((u) => {
  //           if (u.instanceId === unit.instanceId) {
  //             return;
  //           }
  //           const decayCounters = u.counters[CounterType.Decay] || 0;
  //           removeCounters(u, CounterType.Decay, decayCounters);
  //           movedCounters += decayCounters;
  //         });
  //         if (movedCounters > 0) {
  //           addCounters(unit, CounterType.Decay, movedCounters);
  //         }
  //       },
  //     },
  //   ],
  // },
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
      DataAbilityTemplates.counters({
        counterType: CounterType.Decay,
        counterValue: 1,
        range: DataUnitFilters.ennemiesInRow(),
        trigger: { type: TriggerType.AfterMove, range: TriggerRange.Ennemies },
      }),
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
  // dark_ritual: {
  //   id: 'dark_ritual',
  //   name: 'Dark Ritual',
  //   rarity: CardRarity.Common,
  //   type: CardType.Spell,
  //   cost: 2,
  //   colors: [{ color: CardColor.Black, count: 1 }],
  //   actions: [
  //     {
  //       text: "Sacrifice a unit. Deal X damage to a target unit, where X is the sacrificed unit's health.",
  //       targets: [DataTargetTemplates.allies(1), DataTargetTemplates.unit()],
  //       effect: ({ targets }) => {
  //         const sacrificedUnit = targets[0][0] as UnitDeployed;
  //         const targetUnit = targets[1][0] as UnitDeployed;
  //         const sacrificedHealth = sacrificedUnit.health;
  //         damageUnit(targetUnit, sacrificedHealth);
  //         destroyUnit(sacrificedUnit);
  //       },
  //     },
  //   ],
  // },
};
