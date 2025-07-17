import { TargetType, type Ability, type Position, type UnitDeployed } from '@/lib/_model';
import { uiState } from '@/lib/_state';
import { isCellFree, isHumanPlayer, playAbility } from '@/lib/battle';

export function activateAbility(unit: UnitDeployed, ability: Ability) {
  const ui = uiState.battle;
  if (
    ui.abilityPending &&
    ui.abilityPending.unit.instanceId === unit.instanceId &&
    ui.abilityPending.ability.name === ability.name
  ) {
    ui.abilityPending = null;
    return;
  }
  ui.abilityPending = {
    unit,
    ability,
  };
  ui.targetBeingSelected = ability.target || null;
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
