import type { Position, UnitDeployed } from '@/lib/_model';
import { UnitType } from '@/lib/_model/enums';
import { getAdjacentUnits } from '../unit';
import { bs } from '@/lib/_state';

export interface UnitFilterArgs {
  // references
  self?: boolean;
  unit?: UnitDeployed;
  position?: Position;
  // relative to the references
  sameRow?: boolean;
  sameColumn?: boolean;
  allies?: boolean;
  ennemies?: boolean;
  adjacent?: boolean;
  // absolute
  unitType?: UnitType;
}

export function filterUnits(filterArgs: UnitFilterArgs): UnitDeployed[] {
  const relativeToPosition = filterArgs.position ?? filterArgs.unit?.position;
  const validUnits = bs.units.filter((u) => {
    let valid = true;
    if (filterArgs.sameRow && u.position.row !== relativeToPosition?.row) {
      valid = false;
    }
    if (filterArgs.sameColumn && u.position.column !== relativeToPosition?.column) {
      valid = false;
    }
    if (filterArgs.allies && u.ownerPlayerId !== filterArgs.unit?.ownerPlayerId) {
      valid = false;
    }
    if (filterArgs.ennemies && u.ownerPlayerId === filterArgs.unit?.ownerPlayerId) {
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
    return valid;
  });
  if (filterArgs.self && filterArgs.unit) {
    validUnits.push(filterArgs.unit);
  }
  return validUnits;
}

export function getRangeLabel(filterArgs: UnitFilterArgs) {
  let labels = [];
  if (filterArgs.sameRow) {
    labels.push('same row');
  }
  if (filterArgs.sameColumn) {
    labels.push('same column');
  }
  if (filterArgs.allies) {
    labels.push('allies');
  }
  if (filterArgs.ennemies) {
    labels.push('ennemies');
  }
  if (filterArgs.adjacent) {
    labels.push('adjacent');
  }
  if (filterArgs.unitType) {
    labels.push(filterArgs.unitType);
  }
  return `Range: ${labels.join(' ')}`;
}
