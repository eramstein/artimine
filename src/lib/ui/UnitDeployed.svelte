<script lang="ts">
  import type { UnitDeployed } from '../_model';
  import { isUnitActive } from '../battle/unit';
  import { uiState } from '../_state';
  import { setValidTargets, toggleUnitSelection } from './_helpers/selections';
  import { attackUnit } from '../battle/combat';
  import { clearSelections } from './_helpers/selections';
  import Keywords from './Keywords.svelte';
  import Stats from './Stats.svelte';
  import Statuses from './Statuses.svelte';

  let { unit }: { unit: UnitDeployed } = $props();

  // Create the background image path using the card id (same as Card.svelte)
  let cardImagePath = $derived(`/src/assets/images/cards/${unit.id}.png`);

  // Determine if unit is active for border styling
  let isActive = $derived(isUnitActive(unit));

  // Check if this unit is currently selected
  let isSelected = $derived(uiState.battle.selectedUnit?.instanceId === unit.instanceId);

  // Check if this unit is a valid attack target
  let isValidTarget = $derived(uiState.battle.validTargets?.units?.[unit.instanceId] === true);

  function handleUnitClick() {
    const selectedUnit = uiState.battle.selectedUnit;
    if (selectedUnit && isValidTarget) {
      attackUnit(selectedUnit, unit);
      if (selectedUnit.keywords?.moveAndAttack && !selectedUnit.hasMoved) {
        setValidTargets(selectedUnit);
      } else {
        clearSelections();
      }
    } else {
      toggleUnitSelection(unit);
    }
  }
</script>

<div
  class="unit-deployed {isActive ? 'active' : 'inactive'} {isSelected
    ? 'selected'
    : ''} {isValidTarget ? 'valid-target' : ''}"
  style="background-image: url('{cardImagePath}')"
  onclick={handleUnitClick}
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
  }

  .statuses-container {
    position: absolute;
    top: 8px;
    right: 4px;
    z-index: 2;
    width: 100px;
  }
</style>
