import {
  isCard,
  isDeployedUnit,
  isPosition,
  TargetType,
  type Ability,
  type Card,
  type EffectTargets,
  type Land,
  type Position,
  type SpellCard,
  type UnitDeployed,
} from '@/lib/_model';
import { uiState } from '@/lib/_state';
import { isCellFree, isHumanPlayer, playAbility } from '@/lib/battle';
import { isActivityPayable } from '@/lib/battle/cost';
import { getPositionKey } from '@/lib/battle/boards';
import { getEligibleSpellTargets, playSpell } from '@/lib/battle/spell';
import { getEligibleTargets, isTargetCell } from '@/lib/battle/target';

export function activateAbility(unit: UnitDeployed, ability: Ability) {
  if (isActivityPayable(unit, ability) === false) {
    return;
  }
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
  if (ability.target) {
    const eligibleTargets = getEligibleTargets(unit, ability.target);
    setEffectTargets(eligibleTargets);
  }

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
  setEffectTargets(eligibleTargets);

  if (!ui.targetBeingSelected || ui.targetBeingSelected.type === TargetType.Self) {
    playSpell(spell, []);
    clearUiState();
  }
}

function setEffectTargets(eligibleTargets: EffectTargets) {
  const ui = uiState.battle;
  if (ui.targetBeingSelected && ui.targetBeingSelected.type !== TargetType.Self) {
    ui.validTargets = {
      units: {},
      lands: {},
      players: {},
      cells: {},
    };

    if (Array.isArray(eligibleTargets)) {
      // Handle unit targets
      if (isDeployedUnit(eligibleTargets)) {
        (eligibleTargets as UnitDeployed[]).forEach((target) => {
          ui.validTargets!.units![target.instanceId] = true;
        });
      }
      // Handle position targets (for cell-based abilities)
      else if (isPosition(eligibleTargets)) {
        (eligibleTargets as Position[]).forEach((position) => {
          const positionKey = getPositionKey(position);
          ui.validTargets!.cells![positionKey] = true;
        });
      } else if (isCard(eligibleTargets)) {
        (eligibleTargets as Card[]).forEach((card) => {
          ui.validTargets!.cards![card.instanceId] = true;
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
    (!ui.abilityPending && !ui.spellPending) ||
    !ui.targetBeingSelected ||
    !isTargetCell(ui.targetBeingSelected.type)
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

export function targetCard(card: Card) {
  console.log('targetCard', card);
  const ui = uiState.battle;
  if ((!ui.abilityPending && !ui.spellPending) || !ui.targetBeingSelected) return;
  (ui.selectedTargets as Card[]).push(card);
  if (ui.selectedTargets.length >= (ui.targetBeingSelected.count || 0)) {
    if (ui.abilityPending) {
      playAbility(ui.abilityPending.unit, ui.abilityPending.ability, ui.selectedTargets);
    } else if (ui.spellPending) {
      playSpell(ui.spellPending, ui.selectedTargets);
    }
    clearUiState();
  }
}
