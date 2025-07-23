<script lang="ts">
  import type { Land } from '../_model/model-battle';
  import { uiState } from '../_state';
  import { attackLand } from '../battle/combat';
  import { clearSelections, setUnitsTargets } from './_helpers/selections';

  let { land }: { land: Land } = $props();

  let imagePath = $derived(`/src/assets/images/lands/${land.id}.jpg`);
  let isValidTarget = $derived(uiState.battle.validTargets?.lands?.[land.instanceId] === true);

  function handleLandClick() {
    const selectedUnit = uiState.battle.selectedUnit;
    if (selectedUnit && isValidTarget) {
      attackLand(selectedUnit, land);
      if (selectedUnit.keywords?.moveAndAttack && !selectedUnit.hasMoved) {
        setUnitsTargets(selectedUnit);
      } else {
        clearSelections();
      }
    }
  }
</script>

<div
  class="land {isValidTarget ? 'valid-target' : ''}"
  style="background-image: url('{imagePath}')"
  onclick={handleLandClick}
>
  <div class="health">
    {land.health}
  </div>
</div>

<style>
  .land {
    position: relative;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border: 2px solid #333;
    border-radius: 8px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
  }

  .land.valid-target {
    border: 2px solid #ff0000;
    box-shadow: 0 0 8px rgba(255, 0, 0, 0.5);
  }

  .health {
    position: absolute;
    bottom: 4px;
    left: 4px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    min-width: 20px;
    text-align: center;
  }
</style>
