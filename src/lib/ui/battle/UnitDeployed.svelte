<script lang="ts">
  import type { UnitDeployed } from '@lib/_model';
  import { isUnitActive } from '@lib/battle/unit';
  import { uiState } from '@lib/_state';
  import { setUnitsTargets, toggleUnitSelection } from '@lib/ui/_helpers/selections';
  import { attackUnit } from '@lib/battle/combat';
  import { clearSelections } from '@lib/ui/_helpers/selections';
  import Keywords from './Keywords.svelte';
  import Abilities from './Abilities.svelte';
  import Stats from './Stats.svelte';
  import Statuses from './Statuses.svelte';
  import Counters from './Counters.svelte';
  import { targetUnit } from '@lib/ui/_helpers/abilities';
  import { TargetType } from '@lib/_model/enums';

  let { unit }: { unit: UnitDeployed } = $props();

  // Create the background image path using the card id (same as Card.svelte)
  let cardImagePath = $derived(`/src/assets/images/cards/${unit.id}.jpg`);

  // Determine if unit is active for border styling
  let isActive = $derived(isUnitActive(unit));

  // Check if this unit is currently selected
  let isSelected = $derived(uiState.battle.selectedUnit?.instanceId === unit.instanceId);

  // Check if this unit is a valid attack target
  let isValidTarget = $derived(uiState.battle.validTargets?.units?.[unit.instanceId] === true);

  // Check if this unit is currently attacking
  let isAttacking = $derived(uiState.battle.attackingUnitId === unit.instanceId);

  // Check if unit should be dimmed when targetBeingSelected is a unit and this unit is not a valid target
  let isDimmed = $derived(
    uiState.battle.targetBeingSelected?.type === TargetType.Units &&
      !isValidTarget &&
      uiState.battle.targetBeingSelected !== null
  );

  function handleUnitClick() {
    const selectedUnit = uiState.battle.selectedUnit;
    // if target being selected, target this unit
    if (uiState.battle.targetBeingSelected) {
      targetUnit(unit);
      return;
    }
    // else, if selected unit and valid target, attack
    if (selectedUnit && isValidTarget) {
      attackUnit(selectedUnit, unit);
      if (selectedUnit.keywords?.moveAndAttack && !selectedUnit.hasMoved) {
        setUnitsTargets(selectedUnit);
      } else {
        clearSelections();
      }
    } else {
      // else, toggle selection
      toggleUnitSelection(unit);
    }
  }

  // Handle right-click to show CardFull
  function handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    uiState.cardFullOverlay.visible = true;
    uiState.cardFullOverlay.card = unit;
  }

  // Attack direction - move towards the target based on player
  let attackDirection = $derived(unit.ownerPlayerId === 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
</script>

<div
  class="unit-deployed {isActive ? 'active' : 'inactive'} {isSelected
    ? 'selected'
    : ''} {isValidTarget ? 'valid-target' : ''} {isAttacking ? 'attacking' : ''} {isDimmed
    ? 'dimmed'
    : ''}"
  style="background-image: url('{cardImagePath}'); --attack-x: {attackDirection.x}; --attack-y: {attackDirection.y};"
  onclick={handleUnitClick}
  oncontextmenu={handleContextMenu}
>
  {#if unit.statuses}
    <div class="statuses-container">
      <Statuses statuses={unit.statuses} />
    </div>
  {/if}

  <div class="stats-container">
    <Stats power={unit.power} health={unit.health} />
  </div>

  {#if unit.keywords}
    <div class="keywords-container">
      <Keywords keywords={unit.keywords} />
    </div>
  {/if}

  {#if unit.counters && Object.keys(unit.counters).length > 0}
    <div class="counters-container">
      <Counters {unit} />
    </div>
  {/if}

  {#if unit.abilities && unit.abilities.length > 0}
    <div class="abilities-container">
      <Abilities abilities={unit.abilities} {unit} />
    </div>
  {/if}
</div>

<style>
  .unit-deployed {
    position: relative;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 6px;
    overflow: visible;
    border: 3px solid;
    transition:
      border-color 0.2s ease,
      transform 0.3s ease,
      box-shadow 0.3s ease;
    transform: translateZ(0); /* Enable hardware acceleration */
  }

  .unit-deployed.active {
    border-color: #bfa14a;
  }

  .unit-deployed.selected {
    outline: 2px solid #eecd6c;
    transform: translateZ(0) scale(1.02);
    box-shadow: 0 4px 12px rgba(238, 205, 108, 0.3);
  }

  .unit-deployed.inactive {
    border-color: #666;
  }

  .unit-deployed.valid-target {
    border-color: #ff0000;
    box-shadow: 0 0 8px rgba(255, 0, 0, 0.5);
    cursor: pointer;
  }

  .unit-deployed.valid-target:hover {
    transform: translateZ(0) translateY(-4px) scale(1.05);
    box-shadow:
      0 0 8px rgba(255, 0, 0, 0.5),
      0 8px 16px rgba(255, 0, 0, 0.3);
    border-color: #ff4444;
  }

  .unit-deployed.attacking {
    animation: attack-move 0.3s ease-in-out;
  }

  .unit-deployed.dimmed {
    opacity: 0.4;
    filter: grayscale(0.3);
    transition:
      opacity 0.2s ease,
      filter 0.2s ease;
  }

  @keyframes attack-move {
    0% {
      transform: translateZ(0) translateX(0) translateY(0);
    }
    50% {
      transform: translateZ(0) translateX(calc(var(--attack-x, 0) * 30px))
        translateY(calc(var(--attack-y, 0) * 30px));
    }
    100% {
      transform: translateZ(0) translateX(0) translateY(0);
    }
  }

  .stats-container {
    position: absolute;
    bottom: 8px;
    left: 4px;
    z-index: 2;
  }

  .keywords-container {
    position: absolute;
    bottom: 8px;
    right: 4px;
    z-index: 2;
    width: 100px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .counters-container {
    position: absolute;
    bottom: 70px;
    left: 4px;
    z-index: 2;
  }

  .abilities-container {
    position: absolute;
    top: 8px;
    right: 4px;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .unit-deployed:hover .keywords-container,
  .unit-deployed:hover .abilities-container {
    opacity: 1;
  }

  .statuses-container {
    position: absolute;
    top: 8px;
    left: 4px;
    z-index: 2;
  }
</style>
