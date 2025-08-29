import { CounterType, StatusType } from '@/lib/_model';
import type {
  Card,
  EffectArgs,
  Land,
  Position,
  TargetDefinition,
  UnitCard,
  UnitCardTemplate,
  UnitDeployed,
  UnitEndOfTurnEffects,
  UnitKeywords,
} from '@/lib/_model/model-battle';
import { bs } from '@/lib/_state';
import {
  addCounters,
  addStaticKeyword,
  applyTemporaryEffect,
  applyUnitStatus,
  bounceUnit,
  clearUnitStaticAbilities,
  damagePlayer,
  damageUnit,
  destroyUnit,
  discard,
  drawCard,
  getOpposingPlayer,
  getRandomEmptyAlliedCells,
  getTemporaryEffectLabel,
  healUnit,
  incrementColor,
  makeUnit,
  refreshUnit,
  removeCounters,
  summonUnit,
  untapPlayer,
} from '@/lib/battle';
import { reanimate } from '../graveyard';
import { damageLand, fortifyLand } from '../land';
import { forceMoveUnit } from '../move';
import { getTargetLabel } from '../target';
import { DataEffectPrimers } from './effect-primers';
import { getRangeLabel, getUnitsInRange, type UnitFilterArgs } from './unitFilters';

export const DataEffectTemplates: Record<
  string,
  (args: any) => { fn: (p: EffectArgs) => void; label: (targets: TargetDefinition[]) => string }
> = {
  ...DataEffectPrimers,
  reanimate: () => ({
    fn: ({ unit, player, targets }) => {
      if (targets.length < 2) {
        return;
      }
      const playerId = player?.id ?? unit?.ownerPlayerId;
      const reanimatedUnit = targets[0]?.[0] as UnitCard;
      const position = targets[1]?.[0] as Position;
      if (reanimatedUnit && position) {
        reanimate(reanimatedUnit, position, playerId);
      }
    },
    label: () => `Reanimate a unit to a position`,
  }),
  damageEnemyPlayer: ({ damage }) => ({
    fn: ({ unit }) => {
      damagePlayer(getOpposingPlayer(unit), damage);
    },
    label: () => `Deal ${damage} damage to the enemy player`,
  }),
  damageLand: ({ damage }: { damage: number }) => ({
    fn: ({ targets }) => {
      targets.forEach((t) => {
        damageLand(t as unknown as Land, damage);
      });
    },
    label: (targets: TargetDefinition[]) => {
      return `Deal ${damage} damage to ${getTargetLabel(targets[0])}`;
    },
  }),
  damageUnit: ({
    damage,
    range,
    fromTriggerParam,
  }: {
    damage: number;
    range?: UnitFilterArgs;
    fromTriggerParam?: string;
  }) => ({
    fn: ({ targets, unit, player, triggerParams }) => {
      const unitsInRange = fromTriggerParam
        ? [triggerParams[fromTriggerParam]]
        : getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        damageUnit(u, damage);
      });
    },
    label: (targets: TargetDefinition[]) => {
      let targetsLabel = targets.length > 0 ? ` ${getTargetLabel(targets[0])}` : '';
      if (fromTriggerParam) {
        targetsLabel = ` to ${fromTriggerParam}`;
      }
      return `Deal ${damage} damage ${targetsLabel}. ${range ? getRangeLabel(range) : ''}`;
    },
  }),
  healUnit: ({ health, range }: { health: number; range?: UnitFilterArgs }) => ({
    fn: ({ targets, unit, player }) => {
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        healUnit(u, health);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` ${getTargetLabel(targets[0])}` : '';
      return `Heal ${health} to ${targetsLabel}. ${range ? getRangeLabel(range) : ''}`;
    },
  }),
  addCounters: ({
    counterType = CounterType.Growth,
    counterValue = 1,
    range,
    fromTriggerParam,
  }: {
    counterType: CounterType;
    counterValue: number;
    range?: UnitFilterArgs;
    fromTriggerParam?: string;
  }) => ({
    fn: ({ unit, targets, player, triggerParams }) => {
      const unitsInRange = fromTriggerParam
        ? [triggerParams[fromTriggerParam]]
        : getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        addCounters(u, counterType, counterValue);
      });
    },
    label: (targets: TargetDefinition[]) => {
      let targetsLabel = targets.length > 0 ? ` ${getTargetLabel(targets[0])}` : '';
      if (fromTriggerParam) {
        targetsLabel = ` to ${fromTriggerParam}`;
      }
      return `Add ${counterValue} ${counterType} counter${counterValue !== 1 ? 's' : ''}${targetsLabel}. ${range ? getRangeLabel(range) : ''}`;
    },
  }),
  staticKeyword: ({
    abilityName,
    keyword,
    keyWordValue,
    range,
    reset = true,
  }: {
    abilityName: string;
    keyword: keyof UnitKeywords;
    keyWordValue?: number;
    range?: UnitFilterArgs;
    reset?: boolean;
  }) => ({
    fn: ({ unit, targets, player }) => {
      console.log('staticKeyword', unit, targets, player, range);
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      console.log('unitsInRange', unitsInRange);
      const keywordDef = { key: keyword, value: keyWordValue ?? true };
      if (unit && reset) {
        clearUnitStaticAbilities(unit, abilityName);
      }
      unitsInRange.forEach((u) => {
        addStaticKeyword(u, keywordDef, false, abilityName, unit);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
      return `Give ${keyword} ${keyWordValue ? keyWordValue : ''}${targetsLabel}. ${range ? getRangeLabel(range) : ''}`;
    },
  }),
  temporaryEffect: ({
    effect,
    range,
  }: {
    effect: UnitEndOfTurnEffects;
    range?: UnitFilterArgs;
  }) => ({
    fn: ({ unit, targets, player }) => {
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      console.log('temporaryEffect', unitsInRange);
      unitsInRange.forEach((u) => {
        applyTemporaryEffect(u, effect);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
      return `Apply ${getTemporaryEffectLabel(effect)} effect ${targetsLabel} for 1 turn. ${range ? getRangeLabel(range) : ''}`;
    },
  }),
  untapPlayer: () => ({
    fn: ({ player }) => {
      untapPlayer(player);
    },
    label: () => `Untap this player`,
  }),
  incrementColor: (color) => ({
    fn: ({ player }) => {
      incrementColor(player, color, 1);
    },
    label: () => `Add 1 ${color.color} mana`,
  }),
  applyUnitStatus: ({
    statusType,
    duration,
    range,
    fromTriggerParam,
  }: {
    statusType: StatusType;
    duration: number;
    range?: UnitFilterArgs;
    fromTriggerParam?: string;
  }) => ({
    fn: ({ targets, player, unit, triggerParams }) => {
      const unitsInRange = fromTriggerParam
        ? [triggerParams[fromTriggerParam]]
        : getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        applyUnitStatus(u, statusType, duration);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` ${getTargetLabel(targets[0])}` : '';
      return `Apply ${statusType} for ${duration} turn${duration !== 1 ? 's' : ''}${targetsLabel}. ${range ? getRangeLabel(range) : ''}`;
    },
  }),
  summon: ({
    summonedUnit,
    isRespawn,
    randomPositions,
  }: {
    summonedUnit: UnitCardTemplate;
    isRespawn?: boolean;
    randomPositions?: number;
  }) => ({
    fn: ({ targets, player, unit }) => {
      if (isRespawn) {
        const createdUnit = makeUnit(player.id, summonedUnit);
        summonUnit(createdUnit, unit.position);
      } else {
        if (randomPositions) {
          const cells = getRandomEmptyAlliedCells(player.isPlayer, randomPositions);
          cells.forEach((cell) => {
            const createdUnit = makeUnit(player.id, summonedUnit);
            summonUnit(createdUnit, cell);
          });
        } else {
          (targets[0] as Position[]).forEach((cell: Position) => {
            const createdUnit = makeUnit(player.id, summonedUnit);
            summonUnit(createdUnit, cell);
          });
        }
      }
    },
    label: () =>
      isRespawn
        ? `Respawn ${summonedUnit.name} at this unit's position`
        : `Summon ${summonedUnit.name} to target position`,
  }),
  darkRitual: ({ effect = 'damage' }: { effect: 'damage' | 'heal' }) => ({
    fn: ({ targets }) => {
      const sacrificedUnit = targets[0][0] as UnitDeployed;
      const targetUnit = targets[1][0] as UnitDeployed;
      const sacrificedHealth = sacrificedUnit.health;
      if (effect === 'damage') {
        damageUnit(targetUnit, sacrificedHealth);
      } else {
        healUnit(targetUnit, sacrificedHealth);
      }
      destroyUnit(sacrificedUnit);
    },
    label: () =>
      `Sacrifice a unit to ${effect === 'damage' ? 'deal damage' : effect} equal to its health to another unit`,
  }),
  transferCounters: ({ counterType = CounterType.Growth }: { counterType: CounterType }) => ({
    fn: ({ targets }) => {
      const unit = targets[0][0] as UnitDeployed;
      let movedCounters = 0;
      bs.units.forEach((u) => {
        if (u.instanceId === unit.instanceId) {
          return;
        }
        const counters = u.counters[counterType] || 0;
        removeCounters(u, counterType, counters);
        movedCounters += counters;
      });
      if (movedCounters > 0) {
        addCounters(unit, counterType, movedCounters);
      }
    },
    label: () => `Transfer all ${counterType} counters from other units to this unit`,
  }),
  drawCard: ({ cardCount = 1 }) => ({
    fn: ({ player }) => {
      for (let i = 0; i < cardCount; i++) {
        drawCard(player);
      }
    },
    label: () => `Draw ${cardCount} card${cardCount !== 1 ? 's' : ''}`,
  }),
  destroyUnit: ({ range }: { range?: UnitFilterArgs }) => ({
    fn: ({ targets, unit, player }) => {
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        destroyUnit(u);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` ${getTargetLabel(targets[0])}` : '';
      return `Destroy ${targetsLabel} unit${targets.length !== 1 ? 's' : ''}. ${range ? getRangeLabel(range) : ''}`;
    },
  }),
  bounceUnit: ({ range }: { range?: UnitFilterArgs }) => ({
    fn: ({ targets, unit, player }) => {
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        bounceUnit(u);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` ${getTargetLabel(targets[0])}` : '';
      return `Bounce ${targetsLabel} unit${targets.length !== 1 ? 's' : ''}. ${range ? getRangeLabel(range) : ''}`;
    },
  }),
  fortifyLand: ({ amount }: { amount: number }) => ({
    fn: ({ targets, unit }) => {
      const land =
        targets[0] && targets[0].length > 0
          ? (targets[0][0] as Land)
          : (bs.players[unit.ownerPlayerId].lands[unit.position.row] as Land);
      fortifyLand(land, amount);
    },
    label: () => `Fortify land by ${amount}`,
  }),
  refreshUnit: ({ range }: { range?: UnitFilterArgs }) => ({
    fn: ({ targets, unit, player }) => {
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        refreshUnit(u);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` ${getTargetLabel(targets[0])}` : '';
      return `Refresh ${targetsLabel}. ${range ? getRangeLabel(range) : ''}  `;
    },
  }),
  forceMoveUnit: () => ({
    fn: ({ targets }) => {
      const unit = targets[0][0] as UnitDeployed;
      const position = targets[1][0] as Position;
      forceMoveUnit(unit, position);
    },
    label: () => `Force move unit to target position`,
  }),
  cycleCards: () => ({
    fn: ({ targets }) => {
      const cards = targets[0] as Card[];
      const player = bs.players[cards[0].ownerPlayerId];
      cards.forEach((c) => {
        discard(c.instanceId, player.id);
        drawCard(player);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const countLabel = targets[0].count ? ` ${targets[0].count}` : '';
      return `Discard ${countLabel} cards in hand and draw ${countLabel} cards`;
    },
  }),
};
