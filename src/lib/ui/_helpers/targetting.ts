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
import { DataEffectTemplates } from '@/lib/battle/effects/effectTemplates';
import { bs } from '@/lib/_state';

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

export function activateTriggeredAbility(unit: UnitDeployed, ability: Ability, triggerParams: any) {
  const ui = uiState.battle;
  ui.triggeredAbilityPending = { unit, ability, triggerParams };
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
      playTriggeredAbility(unit, ability, [], triggerParams);
      clearUiState();
    }
  } else {
    ui.targetBeingSelected = null;
    playTriggeredAbility(unit, ability, [], triggerParams);
    clearUiState();
  }
}

function playTriggeredAbility(
  unit: UnitDeployed,
  ability: Ability,
  targets: EffectTargets[][],
  triggerParams: any
) {
  console.log(
    unit.name +
      ' uses triggered ability on ' +
      (targets && targets.map((t) => JSON.stringify(t)).join(', '))
  );

  // Execute each effect in the ability
  ability.actions.forEach((actionDef, actionIndex) => {
    const effectTargets = [...targets[actionIndex]];
    // If any TargetType is Self, replace the corresponding targets entry with [unit]
    if (actionDef.targets) {
      actionDef.targets.forEach((def, i) => {
        if (def.type === TargetType.Self) {
          effectTargets[i] = [unit];
        }
      });
    }
    DataEffectTemplates[actionDef.effect.name](actionDef.effect.args).fn({
      unit,
      targets: effectTargets,
      triggerParams,
      player: bs.players[unit.ownerPlayerId],
    });
  });
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
  ui.triggeredAbilityPending = null;
  ui.validTargets = null;
}

function advanceTargetStep() {
  const ui = uiState.battle;
  let actions: any[] = [];
  if (ui.abilityPending) {
    actions = ui.abilityPending.ability.actions || [];
  } else if (ui.spellPending) {
    actions = ui.spellPending.actions || [];
  } else if (ui.triggeredAbilityPending) {
    actions = ui.triggeredAbilityPending.ability.actions || [];
  }

  if (actions.length === 0) {
    // No actions, play immediately
    if (ui.abilityPending) {
      playAbility(ui.abilityPending.unit, ui.abilityPending.ability, []);
    } else if (ui.spellPending) {
      playSpell(ui.spellPending, []);
    } else if (ui.triggeredAbilityPending) {
      playTriggeredAbility(
        ui.triggeredAbilityPending.unit,
        ui.triggeredAbilityPending.ability,
        [],
        ui.triggeredAbilityPending.triggerParams
      );
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
    } else if (ui.triggeredAbilityPending) {
      highlightEligibleTargets(
        getEligibleTargets(ui.triggeredAbilityPending.unit, targets[ui.currentTargetIndex])
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
        } else if (ui.triggeredAbilityPending) {
          highlightEligibleTargets(
            getEligibleTargets(ui.triggeredAbilityPending.unit, nextEffect.targets[0])
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
      } else if (ui.triggeredAbilityPending) {
        playTriggeredAbility(
          ui.triggeredAbilityPending.unit,
          ui.triggeredAbilityPending.ability,
          ui.selectedTargets,
          ui.triggeredAbilityPending.triggerParams
        );
      }
      clearUiState();
    }
  }
}

export function targetUnit(unit: UnitDeployed) {
  const ui = uiState.battle;
  if (
    (!ui.abilityPending && !ui.spellPending && !ui.triggeredAbilityPending) ||
    !ui.targetBeingSelected
  )
    return;
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
    (!ui.abilityPending && !ui.spellPending && !ui.triggeredAbilityPending) ||
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
  if (
    (!ui.abilityPending && !ui.spellPending && !ui.triggeredAbilityPending) ||
    !ui.targetBeingSelected
  )
    return;
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
