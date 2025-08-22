import type { EffectTargets, Player, Position, UnitDeployed, UnitKeywords } from '@/lib/_model';
import { UnitType } from '@/lib/_model/enums';
import { getAdjacentUnits, getClosestEnnemyInRow } from '../unit';
import { bs } from '@/lib/_state';

export interface UnitFilterArgs {
  // references
  unit?: UnitDeployed;
  position?: Position;
  player?: Player;
  all?: boolean;
  // relative to the references
  self?: boolean;
  addSelf?: boolean;
  sameRow?: boolean;
  sameColumn?: boolean;
  allies?: boolean;
  ennemies?: boolean;
  adjacent?: boolean;
  inFrontOf?: boolean;
  // absolute
  unitType?: UnitType;
  hasKeyword?: keyof UnitKeywords;
}

export function filterUnits(filterArgs: UnitFilterArgs): UnitDeployed[] {
  if (filterArgs.all) {
    return bs.units;
  }
  if (filterArgs.self && filterArgs.unit) {
    return [filterArgs.unit];
  }
  const relativeToPlayerId = filterArgs.player?.id ?? filterArgs.unit?.ownerPlayerId;
  const relativeToPosition = filterArgs.position ?? filterArgs.unit?.position;
  const closestEnnemyInRow =
    filterArgs.inFrontOf && filterArgs.unit ? getClosestEnnemyInRow(filterArgs.unit) : undefined;
  const validUnits = bs.units.filter((u) => {
    let valid = true;
    if (filterArgs.sameRow && u.position.row !== relativeToPosition?.row) {
      valid = false;
    }
    if (filterArgs.inFrontOf && closestEnnemyInRow?.instanceId !== u.instanceId) {
      valid = false;
    }
    if (filterArgs.sameColumn && u.position.column !== relativeToPosition?.column) {
      valid = false;
    }
    if (filterArgs.allies && u.ownerPlayerId !== relativeToPlayerId) {
      valid = false;
    }
    if (filterArgs.ennemies && u.ownerPlayerId === relativeToPlayerId) {
      valid = false;
    }
    if (
      filterArgs.adjacent &&
      filterArgs.unit &&
      !getAdjacentUnits(u.position).includes(filterArgs.unit)
    ) {
      valid = false;
    }
    if (filterArgs.unitType && !u.unitTypes?.includes(filterArgs.unitType)) {
      valid = false;
    }
    if (filterArgs.hasKeyword && !u.keywords?.[filterArgs.hasKeyword]) {
      valid = false;
    }
    return valid;
  });
  if (filterArgs.addSelf && filterArgs.unit) {
    validUnits.push(filterArgs.unit);
  }
  return validUnits;
}

export function getRangeLabel(filterArgs: UnitFilterArgs) {
  let labels = [];
  if (filterArgs.all) {
    labels.push('all units');
  }
  if (filterArgs.sameRow) {
    labels.push('same row');
  }
  if (filterArgs.sameColumn) {
    labels.push('same column');
  }
  if (filterArgs.adjacent) {
    labels.push('adjacent');
  }
  if (filterArgs.allies) {
    labels.push('allies');
  }
  if (filterArgs.ennemies) {
    labels.push('ennemies');
  }
  if (filterArgs.inFrontOf) {
    labels.push('in front of');
  }
  if (filterArgs.unitType) {
    labels.push(filterArgs.unitType);
  }
  return `Range: ${labels.join(' ')}.`;
}

// helper function to loop units.
// if there are targets, we assume the first one is the units to loop on
// else, only use the range (e.g. all ennemies)
export function getUnitsInRange(
  targets: UnitDeployed[][] | undefined, // assumption: 1st one is units
  range: UnitFilterArgs | undefined,
  unit: UnitDeployed,
  player: Player
): UnitDeployed[] {
  let unitsInRange: UnitDeployed[] = [];
  if (targets && targets[0]?.length) {
    const targetUnits = targets[0];
    targetUnits.forEach((u) => {
      unitsInRange = range ? filterUnits({ unit: u, ...range }) : [u];
    });
  } else if (range) {
    unitsInRange = filterUnits({ unit, player, ...range });
  } else if (unit) {
    unitsInRange = [unit];
  }
  return unitsInRange;
}
