<script lang="ts">
  import type { UnitCardDeployed } from '../_model';
  import { isUnitActive } from '../battle/unit';
  import { uiState } from '../_state';
  import { setValidTargets, toggleUnitSelection } from './_helpers/selections';
  import { attackUnit } from '../battle/combat';
  import { clearSelections } from './_helpers/selections';
  import Keywords from './Keywords.svelte';

  let { unit }: { unit: UnitCardDeployed } = $props();

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
  <div class="stats">
    <div class="power">
      {unit.power}
    </div>
    <div class="health">
      {unit.health}
    </div>
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

  .stats {
    position: absolute;
    bottom: 8px;
    left: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 2;
  }

  .keywords-container {
    position: absolute;
    bottom: 8px;
    right: 8px;
    z-index: 2;
    width: 100px;
  }

  .power,
  .health {
    background: #000;
    color: white;
    padding: 2px 4px;
    border-radius: 50%;
    font-weight: bold;
    font-size: 0.9rem;
    text-shadow: 0 1px 2px #000;
    min-width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid #bfa14a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .power {
    background: #000;
  }

  .health {
    background: #8b0000;
  }
</style>
