import { CounterType } from '../_model';
import type { UnitDeployed } from '../_model/model-battle';
import { modifyUnitHealth } from './unit';

export function addCounters(unit: UnitDeployed, counterType: CounterType, value: number) {
  unit.counters[counterType] = (unit.counters[counterType] || 0) + value;

  switch (counterType) {
    case CounterType.Growth:
      unit.power += value;
      modifyUnitHealth(unit, value);
      break;
    case CounterType.Decay:
      unit.power -= value;
      modifyUnitHealth(unit, -value);
      break;
  }
}

export function removeCounters(unit: UnitDeployed, counterType: CounterType, value: number) {
  unit.counters[counterType] = (unit.counters[counterType] || 0) - value;

  switch (counterType) {
    case CounterType.Growth:
      unit.power -= value;
      modifyUnitHealth(unit, -value);
      break;
    case CounterType.Decay:
      unit.power += value;
      modifyUnitHealth(unit, value);
      break;
  }
}
