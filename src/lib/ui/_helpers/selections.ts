import { uiState } from '../../_state';
import { isLand, isPlayer, type UnitCardDeployed } from '../../_model';
import { canAttack, validAttackTargets } from '@/lib/battle/combat';
import { canMove, validMoveTargets } from '@/lib/battle/move';

export function toggleUnitSelection(unit: UnitCardDeployed) {
  if (uiState.battle.selectedUnit?.instanceId === unit.instanceId) {
    uiState.battle.selectedUnit = null;
    uiState.battle.validTargets = null;
    return;
  }
  uiState.battle.selectedUnit = unit;
  setValidTargets(unit);
}

export function setValidTargets(unit: UnitCardDeployed) {
  uiState.battle.validTargets = {
    units: {},
    lands: {},
    players: {},
    moves: {},
  };
  if (canAttack(unit)) {
    const validTargets = validAttackTargets(unit);
    if (Array.isArray(validTargets)) {
      validTargets.forEach((target) => {
        uiState.battle.validTargets!.units![target.instanceId] = true;
      });
    } else {
      if (isLand(validTargets)) {
        uiState.battle.validTargets!.lands![validTargets.instanceId] = true;
      } else if (isPlayer(validTargets)) {
        uiState.battle.validTargets!.players![validTargets.id] = true;
      }
    }
  }
  if (canMove(unit)) {
    uiState.battle.validTargets!.moves = validMoveTargets(unit);
  }
}

export function clearSelections() {
  uiState.battle.selectedUnit = null;
  uiState.battle.validTargets = null;
}
