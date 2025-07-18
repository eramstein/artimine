import {
  TargetType,
  type Ability,
  type Position,
  type SpellCard,
  type UnitDeployed,
} from '@/lib/_model';
import { uiState } from '@/lib/_state';
import { isCellFree, isHumanPlayer, playAbility, getEligibleAbilityTargets } from '@/lib/battle';
import { getPositionKey } from '@/lib/battle/boards';
import { getEligibleSpellTargets, playSpell } from '@/lib/battle/spell';

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
  const eligibleTargets = getEligibleAbilityTargets(unit, ability);
  setValidTargets(eligibleTargets);

  if (!ui.targetBeingSelected || ui.targetBeingSelected.type === TargetType.Self) {
    playAbility(unit, ability, []);
    clearUiState();
  }
}

export function activateSpell(spell: SpellCard) {
  const ui = uiState.battle;
  if (ui.spellPending && ui.spellPending.instanceId === spell.instanceId) {
    ui.spellPending = null;
    ui.validTargets = null;
    return;
  }
  ui.spellPending = spell;
  ui.targetBeingSelected = spell.target || null;

  // Set valid targets for spell
  const eligibleTargets = getEligibleSpellTargets(spell);
  setValidTargets(eligibleTargets);

  if (!ui.targetBeingSelected || ui.targetBeingSelected.type === TargetType.Self) {
    playSpell(spell, []);
    clearUiState();
  }
}

function setValidTargets(eligibleTargets: UnitDeployed[] | Position[]) {
  const ui = uiState.battle;
  if (ui.targetBeingSelected && ui.targetBeingSelected.type !== TargetType.Self) {
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
}

function clearUiState() {
  const ui = uiState.battle;
  ui.selectedTargets = [];
  ui.targetBeingSelected = null;
  ui.abilityPending = null;
  ui.spellPending = null;
  ui.validTargets = null;
}

export function targetUnit(unit: UnitDeployed) {
  const ui = uiState.battle;
  if ((!ui.abilityPending && !ui.spellPending) || !ui.targetBeingSelected) return;
  if (
    ([TargetType.Ally, TargetType.Any].includes(ui.targetBeingSelected.type) &&
      isHumanPlayer(unit.ownerPlayerId)) ||
    ([TargetType.Foe, TargetType.Any].includes(ui.targetBeingSelected.type) &&
      !isHumanPlayer(unit.ownerPlayerId))
  ) {
    (ui.selectedTargets as UnitDeployed[]).push(unit);
    if (ui.selectedTargets.length >= (ui.targetBeingSelected.count || 0)) {
      if (ui.abilityPending) {
        playAbility(ui.abilityPending.unit, ui.abilityPending.ability, ui.selectedTargets);
      } else if (ui.spellPending) {
        playSpell(ui.spellPending, ui.selectedTargets);
      }
      clearUiState();
    }
  }
}

export function targetCell(position: Position) {
  const ui = uiState.battle;
  if (
    !(ui.abilityPending && !ui.spellPending) ||
    !ui.targetBeingSelected ||
    ui.targetBeingSelected.type !== TargetType.EmptyCell
  )
    return;
  if (isCellFree(position)) {
    (ui.selectedTargets as Position[]).push(position);
    if (ui.selectedTargets.length >= (ui.targetBeingSelected.count || 0)) {
      if (ui.abilityPending) {
        playAbility(ui.abilityPending.unit, ui.abilityPending.ability, ui.selectedTargets);
      } else if (ui.spellPending) {
        playSpell(ui.spellPending, ui.selectedTargets);
      }
      clearUiState();
    }
  }
}
