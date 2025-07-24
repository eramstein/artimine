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
    ui.abilityPending.ability.name === ability.name
  ) {
    clearUiState();
    return;
  }
  ui.abilityPending = { unit, ability };
  ui.currentTargetIndex = 0;
  ui.selectedTargets = [];
  const targets = ability.targets || [];
  if (targets.length > 0) {
    ui.targetBeingSelected = targets[0];
    setEffectTargets(getEligibleTargets(unit, targets[0]));
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
  ui.currentTargetIndex = 0;
  ui.selectedTargets = [];
  const targets = spell.targets || [];
  if (targets.length > 0) {
    ui.targetBeingSelected = targets[0];
    setEffectTargets(getEligibleSpellTargetsForIndex(spell, 0));
  } else {
    ui.targetBeingSelected = null;
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

function getEligibleSpellTargetsForIndex(spell: SpellCard, index: number): EffectTargets {
  const targets = spell.targets || [];
  if (targets[index]) {
    return getEligibleTargets(spell, targets[index]);
  }
  return [];
}

function clearUiState() {
  const ui = uiState.battle;
  ui.selectedTargets = [];
  ui.currentTargetIndex = 0;
  ui.targetBeingSelected = null;
  ui.abilityPending = null;
  ui.spellPending = null;
  ui.validTargets = null;
}

function advanceTargetStep() {
  const ui = uiState.battle;
  const targets = ui.abilityPending
    ? ui.abilityPending.ability.targets || []
    : ui.spellPending?.targets || [];
  ui.currentTargetIndex++;
  if (ui.currentTargetIndex < targets.length) {
    ui.targetBeingSelected = targets[ui.currentTargetIndex];
    if (ui.abilityPending) {
      setEffectTargets(getEligibleTargets(ui.abilityPending.unit, targets[ui.currentTargetIndex]));
    } else if (ui.spellPending) {
      setEffectTargets(getEligibleSpellTargetsForIndex(ui.spellPending, ui.currentTargetIndex));
    }
  } else {
    // All targets selected, play
    if (ui.abilityPending) {
      playAbility(ui.abilityPending.unit, ui.abilityPending.ability, ui.selectedTargets);
    } else if (ui.spellPending) {
      playSpell(ui.spellPending, ui.selectedTargets);
    }
    clearUiState();
  }
}

export function targetUnit(unit: UnitDeployed) {
  const ui = uiState.battle;
  if ((!ui.abilityPending && !ui.spellPending) || !ui.targetBeingSelected) return;
  const currentIdx = ui.currentTargetIndex || 0;
  if (!ui.selectedTargets[currentIdx]) ui.selectedTargets[currentIdx] = [];
  (ui.selectedTargets[currentIdx] as UnitDeployed[]).push(unit);
  if (ui.selectedTargets[currentIdx].length >= (ui.targetBeingSelected.count || 1)) {
    advanceTargetStep();
  }
}

export function targetCell(position: Position) {
  const ui = uiState.battle;
  if (
    (!ui.abilityPending && !ui.spellPending) ||
    !ui.targetBeingSelected ||
    ui.targetBeingSelected.type !== TargetType.Cell
  )
    return;
  const currentIdx = ui.currentTargetIndex || 0;
  if (!ui.selectedTargets[currentIdx]) ui.selectedTargets[currentIdx] = [];
  (ui.selectedTargets[currentIdx] as Position[]).push(position);
  if (ui.selectedTargets[currentIdx].length >= (ui.targetBeingSelected.count || 1)) {
    advanceTargetStep();
  }
}

export function targetCard(card: Card) {
  const ui = uiState.battle;
  if ((!ui.abilityPending && !ui.spellPending) || !ui.targetBeingSelected) return;
  const currentIdx = ui.currentTargetIndex || 0;
  if (!ui.selectedTargets[currentIdx]) ui.selectedTargets[currentIdx] = [];
  (ui.selectedTargets[currentIdx] as Card[]).push(card);
  if (ui.selectedTargets[currentIdx].length >= (ui.targetBeingSelected.count || 1)) {
    advanceTargetStep();
  }
}
