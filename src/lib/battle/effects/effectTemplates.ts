import {
  addStaticKeyword,
  applyTemporaryEffect,
  damagePlayer,
  damageUnit,
  getOpposingPlayer,
  addCounters,
  untapPlayer,
  incrementColor,
  applyUnitStatus,
  summonUnit,
  makeUnit,
  destroyUnit,
  removeCounters,
  healUnit,
  drawCard,
  clearUnitStaticAbilities,
  getRandomEmptyAlliedCells,
  refreshUnit,
} from '@/lib/battle';
import { CardColor, CounterType, StatusType } from '@/lib/_model';
import type {
  EffectArgs,
  Position,
  UnitCard,
  UnitDeployed,
  UnitEndOfTurnEffects,
  UnitCardTemplate,
  TargetDefinition,
  UnitKeywords,
  Land,
} from '@/lib/_model/model-battle';
import { bs } from '@/lib/_state';
import { reanimate } from '../graveyard';
import { filterUnits, getRangeLabel, getUnitsInRange, type UnitFilterArgs } from './unitFilters';
import { getTargetLabel } from '../target';
import { fortifyLand } from '../land';

export const DataEffectTemplates: Record<
  string,
  (args: any) => { fn: (p: EffectArgs) => void; label: (targets: TargetDefinition[]) => string }
> = {
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
  damageUnit: ({ damage, range }: { damage: number; range?: UnitFilterArgs }) => ({
    fn: ({ targets, unit, player }) => {
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        damageUnit(u, damage);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
      return `Deal ${damage} damage to ${targetsLabel}. ${range ? getRangeLabel(range) : ''}`;
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
      const targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
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
      const unitsInRange = fromTriggerParam ? [triggerParams[fromTriggerParam]] : getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        addCounters(u, counterType, counterValue);
      });
    },
    label: (targets: TargetDefinition[]) => {
      let targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
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
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
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
      return `Apply ${JSON.stringify(effect)} effect to ${targetsLabel}. ${range ? getRangeLabel(range) : ''}`;
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
  }: {
    statusType: StatusType;
    duration: number;
    range?: UnitFilterArgs;
  }) => ({
    fn: ({ targets, player, unit }) => {
      const unitsInRange = getUnitsInRange(targets as UnitDeployed[][], range, unit, player);
      unitsInRange.forEach((u) => {
        applyUnitStatus(u, statusType, duration);
      });
    },
    label: (targets: TargetDefinition[]) => {
      const targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
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
  darkRitual: () => ({
    fn: ({ targets }) => {
      const sacrificedUnit = targets[0][0] as UnitDeployed;
      const targetUnit = targets[1][0] as UnitDeployed;
      const sacrificedHealth = sacrificedUnit.health;
      damageUnit(targetUnit, sacrificedHealth);
      destroyUnit(sacrificedUnit);
    },
    label: () => 'Sacrifice a unit to deal damage equal to its health to another unit',
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
      const targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
      return `Destroy ${targetsLabel} unit${targets.length !== 1 ? 's' : ''}. ${range ? getRangeLabel(range) : ''}`;
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
      const targetsLabel = targets.length > 0 ? ` to ${getTargetLabel(targets[0])}` : '';
      return `Refresh ${targetsLabel} unit${targets.length !== 1 ? 's' : ''}. ${range ? getRangeLabel(range) : ''}  `;
    },
  }),
};
