import { CardType, type Land, type Player, type UnitDeployed } from '@/lib/_model';

export function isAttackTargetUnit(target: UnitDeployed | Land | Player): target is UnitDeployed {
  return 'type' in target && target.type === CardType.Unit;
}

export function isAttackTargetLand(target: UnitDeployed | Land | Player): target is Land {
  return 'type' in target && target.type === CardType.Land;
}

export function isAttackTargetPlayer(target: UnitDeployed | Land | Player): target is Player {
  return 'isPlayer' in target;
}
