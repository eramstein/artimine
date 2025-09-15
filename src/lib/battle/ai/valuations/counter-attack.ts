import type { UnitDeployed } from '@/lib/_model';
import { getEnnemyUnitsInRow } from '../../unit';
import { unitLifeValue } from './config';
import { valueUnit, wouldBeDestroyed, wouldBeDestroyedByCounterAttack } from './unit';

// this evaluates how much value would be lost if that unit doesn't move and gets counter attacked
export function getCounterAttackValue(attacker: UnitDeployed, attackTarget: UnitDeployed) {
  const defenders = getEnnemyUnitsInRow(attacker).filter((defender) => {
    return (
      defender.instanceId !== attackTarget.instanceId || !wouldBeDestroyed(attackTarget, attacker)
    );
  });
  const destroyed = wouldBeDestroyedByCounterAttack(attacker, defenders);
  if (destroyed) {
    return valueUnit(attacker);
  }
  if (attacker.keywords?.retaliate) {
    return -attacker.keywords?.retaliate * unitLifeValue * defenders.length;
  }
  return 0;
}
