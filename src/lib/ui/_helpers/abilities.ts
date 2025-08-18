import {
  isCard,
  isDeployedUnit,
  isPosition,
  TargetType,
  type Ability,
  type Card,
  type EffectTargets,
  type Position,
  type SpellCard,
  type UnitDeployed,
} from '@/lib/_model';
import { uiState } from '@/lib/_state';
import { playAbility } from '@/lib/battle';
import { isActivityPayable } from '@/lib/battle/cost';
import { getPositionKey } from '@/lib/battle/boards';
import { playSpell } from '@/lib/battle/spell';
import { getEligibleTargets } from '@/lib/battle/target';

export function activateAbility(unit: UnitDeployed, ability: Ability) {
  if (isActivityPayable(unit, ability) === false) {
    return;
  }
  const ui = uiState.battle;
  if (
    ui.abilityPending &&
    ui.abilityPending.unit.instanceId === unit.instanceId &&
    ui.abilityPending.ability === ability
  ) {
    clearUiState();
    return;
  }
  ui.abilityPending = { unit, ability };
  ui.currentEffectIndex = 0;
  ui.currentTargetIndex = 0;
  ui.selectedTargets = [];

  const actions = ability.actions || [];
  if (actions.length > 0) {
    const firstEffect = actions[0];
    if (firstEffect.targets && firstEffect.targets.length > 0) {
      ui.targetBeingSelected = firstEffect.targets[0];
      highlightEligibleTargets(getEligibleTargets(unit, firstEffect.targets[0]));
    } else {
      ui.targetBeingSelected = null;
      playAbility(unit, ability, []);
      clearUiState();
    }
  } else {
    ui.targetBeingSelected = null;
    playAbility(unit, ability, []);
    clearUiState();
  }
}

export function activateSpell(spell: SpellCard) {
  const ui = uiState.battle;
  if (ui.spellPending && ui.spellPending.instanceId === spell.instanceId) {
    clearUiState();
    return;
  }
  ui.spellPending = spell;
  ui.currentEffectIndex = 0;
  ui.currentTargetIndex = 0;
  ui.selectedTargets = [];

  const actions = spell.actions || [];
  if (actions.length > 0) {
    const firstEffect = actions[0];
    if (firstEffect.targets && firstEffect.targets.length > 0) {
      ui.targetBeingSelected = firstEffect.targets[0];
      highlightEligibleTargets(getEligibleSpellTargetsForIndex(spell, 0, 0));
    } else {
      ui.targetBeingSelected = null;
      playSpell(spell, []);
      clearUiState();
    }
  } else {
    ui.targetBeingSelected = null;
    playSpell(spell, []);
    clearUiState();
  }
}

function highlightEligibleTargets(eligibleTargets: EffectTargets) {
  const ui = uiState.battle;
  if (ui.targetBeingSelected && ui.targetBeingSelected.type !== TargetType.Self) {
    ui.validTargets = {
      units: {},
      lands: {},
      players: {},
      cells: {},
      cards: {},
    };
    if (Array.isArray(eligibleTargets)) {
      if (isDeployedUnit(eligibleTargets)) {
        (eligibleTargets as UnitDeployed[]).forEach((target) => {
          ui.validTargets!.units![target.instanceId] = true;
        });
      } else if (isPosition(eligibleTargets)) {
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

function getEligibleSpellTargetsForIndex(
  spell: SpellCard,
  effectIndex: number,
  targetIndex: number
): EffectTargets {
  const actions = spell.actions || [];
  if (actions[effectIndex]) {
    const effect = actions[effectIndex];
    const targets = effect.targets || [];
    if (targets[targetIndex]) {
      return getEligibleTargets(spell, targets[targetIndex]);
    }
  }
  return [];
}

function clearUiState() {
  const ui = uiState.battle;
  ui.selectedTargets = [];
  ui.currentEffectIndex = 0;
  ui.currentTargetIndex = 0;
  ui.targetBeingSelected = null;
  ui.abilityPending = null;
  ui.spellPending = null;
  ui.validTargets = null;
}

function advanceTargetStep() {
  const ui = uiState.battle;
  const actions = ui.abilityPending
    ? ui.abilityPending.ability.actions || []
    : ui.spellPending?.actions || [];

  if (actions.length === 0) {
    // No actions, play immediately
    if (ui.abilityPending) {
      playAbility(ui.abilityPending.unit, ui.abilityPending.ability, []);
    } else if (ui.spellPending) {
      playSpell(ui.spellPending, []);
    }
    clearUiState();
    return;
  }

  const currentEffect = actions[ui.currentEffectIndex];
  const targets = currentEffect?.targets || [];

  ui.currentTargetIndex++;
  if (ui.currentTargetIndex < targets.length) {
    ui.targetBeingSelected = targets[ui.currentTargetIndex];
    if (ui.abilityPending) {
      highlightEligibleTargets(
        getEligibleTargets(ui.abilityPending.unit, targets[ui.currentTargetIndex])
      );
    } else if (ui.spellPending) {
      highlightEligibleTargets(
        getEligibleSpellTargetsForIndex(
          ui.spellPending,
          ui.currentEffectIndex,
          ui.currentTargetIndex
        )
      );
    }
  } else {
    // All targets for current effect selected, move to next effect
    ui.currentEffectIndex++;
    ui.currentTargetIndex = 0;

    if (ui.currentEffectIndex < actions.length) {
      const nextEffect = actions[ui.currentEffectIndex];
      if (nextEffect.targets && nextEffect.targets.length > 0) {
        ui.targetBeingSelected = nextEffect.targets[0];
        if (ui.abilityPending) {
          highlightEligibleTargets(
            getEligibleTargets(ui.abilityPending.unit, nextEffect.targets[0])
          );
        } else if (ui.spellPending) {
          highlightEligibleTargets(
            getEligibleSpellTargetsForIndex(ui.spellPending, ui.currentEffectIndex, 0)
          );
        }
      } else {
        // Next effect has no targets, advance again
        advanceTargetStep();
      }
    } else {
      // All actions completed, play
      if (ui.abilityPending) {
        playAbility(ui.abilityPending.unit, ui.abilityPending.ability, ui.selectedTargets);
      } else if (ui.spellPending) {
        playSpell(ui.spellPending, ui.selectedTargets);
      }
      clearUiState();
    }
  }
}

export function targetUnit(unit: UnitDeployed) {
  const ui = uiState.battle;
  if ((!ui.abilityPending && !ui.spellPending) || !ui.targetBeingSelected) return;
  const currentEffectIdx = ui.currentEffectIndex || 0;
  const currentTargetIdx = ui.currentTargetIndex || 0;

  if (!ui.selectedTargets[currentEffectIdx]) ui.selectedTargets[currentEffectIdx] = [];
  if (!ui.selectedTargets[currentEffectIdx][currentTargetIdx])
    ui.selectedTargets[currentEffectIdx][currentTargetIdx] = [];

  (ui.selectedTargets[currentEffectIdx][currentTargetIdx] as UnitDeployed[]).push(unit);
  if (
    ui.selectedTargets[currentEffectIdx][currentTargetIdx].length >=
    (ui.targetBeingSelected.count || 1)
  ) {
    advanceTargetStep();
  }
}

export function targetCell(position: Position) {
  const ui = uiState.battle;
  if (
    (!ui.abilityPending && !ui.spellPending) ||
    !ui.targetBeingSelected ||
    ![TargetType.Cell, TargetType.AllyCell, TargetType.EmptyCell].includes(
      ui.targetBeingSelected.type
    )
  )
    return;
  const currentEffectIdx = ui.currentEffectIndex || 0;
  const currentTargetIdx = ui.currentTargetIndex || 0;

  if (!ui.selectedTargets[currentEffectIdx]) ui.selectedTargets[currentEffectIdx] = [];
  if (!ui.selectedTargets[currentEffectIdx][currentTargetIdx])
    ui.selectedTargets[currentEffectIdx][currentTargetIdx] = [];

  (ui.selectedTargets[currentEffectIdx][currentTargetIdx] as Position[]).push(position);
  if (
    ui.selectedTargets[currentEffectIdx][currentTargetIdx].length >=
    (ui.targetBeingSelected.count || 1)
  ) {
    advanceTargetStep();
  }
}

export function targetCard(card: Card) {
  const ui = uiState.battle;
  if ((!ui.abilityPending && !ui.spellPending) || !ui.targetBeingSelected) return;
  const currentEffectIdx = ui.currentEffectIndex || 0;
  const currentTargetIdx = ui.currentTargetIndex || 0;

  if (!ui.selectedTargets[currentEffectIdx]) ui.selectedTargets[currentEffectIdx] = [];
  if (!ui.selectedTargets[currentEffectIdx][currentTargetIdx])
    ui.selectedTargets[currentEffectIdx][currentTargetIdx] = [];

  (ui.selectedTargets[currentEffectIdx][currentTargetIdx] as Card[]).push(card);
  if (
    ui.selectedTargets[currentEffectIdx][currentTargetIdx].length >=
    (ui.targetBeingSelected.count || 1)
  ) {
    if (ui.graveyardModal.visible) {
      ui.graveyardModal.visible = false;
      ui.graveyardModal.playerId = null;
    }
    advanceTargetStep();
  }
}
