import { CounterType } from '../_model';
import type { UnitDeployed } from '../_model/model-battle';

export function addCounters(unit: UnitDeployed, counterType: CounterType, value: number) {
  unit.counters[counterType] = (unit.counters[counterType] || 0) + value;

  switch (counterType) {
    case CounterType.Growth:
      unit.power += value;
      unit.health += value;
      unit.maxHealth += value;
      break;
    case CounterType.Decay:
      unit.power -= value;
      unit.health -= value;
      unit.maxHealth -= value;
      break;
  }
}

export function removeCounters(unit: UnitDeployed, counterType: CounterType, value: number) {
  unit.counters[counterType] = (unit.counters[counterType] || 0) - value;

  switch (counterType) {
    case CounterType.Growth:
      unit.power -= value;
      unit.health -= value;
      unit.maxHealth -= value;
      break;
    case CounterType.Decay:
      unit.power += value;
      unit.health += value;
      unit.maxHealth += value;
      break;
  }
}
