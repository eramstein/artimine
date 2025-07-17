import { TargetType, type Ability, type Position, type UnitDeployed } from '@/lib/_model';
import { uiState } from '@/lib/_state';
import { isCellFree, isHumanPlayer, playAbility, getEligibleTargets } from '@/lib/battle';
import { getPositionKey } from '@/lib/battle/boards';

export function activateAbility(unit: UnitDeployed, ability: Ability) {
  const ui = uiState.battle;
  if (
    ui.abilityPending &&
    ui.abilityPending.unit.instanceId === unit.instanceId &&
    ui.abilityPending.ability.name === ability.name
  ) {
    ui.abilityPending = null;
    ui.validTargets = null;
    return;
  }
  ui.abilityPending = {
    unit,
    ability,
  };
  ui.targetBeingSelected = ability.target || null;

  // Set valid targets for ability selection
  if (ui.targetBeingSelected && ui.targetBeingSelected.type !== TargetType.Self) {
    const eligibleTargets = getEligibleTargets(unit, ability);
    ui.validTargets = {
      units: {},
      lands: {},
      players: {},
      moves: {},
    };

    if (Array.isArray(eligibleTargets)) {
      // Handle unit targets
      if (eligibleTargets.length > 0 && 'instanceId' in eligibleTargets[0]) {
        (eligibleTargets as UnitDeployed[]).forEach((target) => {
          ui.validTargets!.units![target.instanceId] = true;
        });
      }
      // Handle position targets (for cell-based abilities)
      else if (eligibleTargets.length > 0 && 'row' in eligibleTargets[0]) {
        (eligibleTargets as Position[]).forEach((position) => {
          const positionKey = getPositionKey(position);
          ui.validTargets!.moves![positionKey] = true;
        });
      }
    }
  } else {
    ui.validTargets = null;
  }

  if (!ui.targetBeingSelected || ui.targetBeingSelected.type === TargetType.Self) {
    playAbility(unit, ability, []);
    clearAbilityUiState();
  }
}

export function clearAbilityUiState() {
  const ui = uiState.battle;
  ui.selectedTargets = [];
  ui.targetBeingSelected = null;
  ui.abilityPending = null;
  ui.validTargets = null;
}

export function targetUnit(unit: UnitDeployed) {
  const ui = uiState.battle;
  if (!ui.abilityPending || !ui.targetBeingSelected) return;
  if (
    ([TargetType.Ally, TargetType.Any].includes(ui.targetBeingSelected.type) &&
      isHumanPlayer(unit.ownerPlayerId)) ||
    ([TargetType.Foe, TargetType.Any].includes(ui.targetBeingSelected.type) &&
      !isHumanPlayer(unit.ownerPlayerId))
  ) {
    (ui.selectedTargets as UnitDeployed[]).push(unit);
    if (ui.selectedTargets.length >= (ui.targetBeingSelected.count || 0)) {
      playAbility(ui.abilityPending.unit, ui.abilityPending.ability, ui.selectedTargets);
      clearAbilityUiState();
    }
  }
}

export function targetCell(position: Position) {
  const ui = uiState.battle;
  if (
    !ui.abilityPending ||
    !ui.targetBeingSelected ||
    ui.targetBeingSelected.type !== TargetType.EmptyCell
  )
    return;
  if (isCellFree(position)) {
    (ui.selectedTargets as Position[]).push(position);
    if (ui.selectedTargets.length >= (ui.targetBeingSelected.count || 0)) {
      playAbility(ui.abilityPending.unit, ui.abilityPending.ability, ui.selectedTargets);
      clearAbilityUiState();
    }
  }
}
