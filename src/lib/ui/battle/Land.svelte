<script lang="ts">
  import type { Land } from '@lib/_model';
  import { TargetType } from '@lib/_model';
  import { bs, uiState } from '@lib/_state';
  import { getLandImagePath } from '@lib/_utils/asset-paths';
  import { attackLand } from '@lib/battle/combat';
  import { isHumanPlayer, usePlayerColorAbility } from '@lib/battle/player';
  import { clearSelections, setUnitsTargets } from '@lib/ui/_helpers/selections';
  import { targetLand } from '@lib/ui/_helpers/targetting';

  let { land }: { land: Land } = $props();

  let imagePath = $derived(getLandImagePath(land.id));
  let isValidTarget = $derived(uiState.battle.validTargets?.lands?.[land.instanceId] === true);

  function handleLandClick() {
    const selectedUnit = uiState.battle.selectedUnit;
    if (
      uiState.battle.targetBeingSelected &&
      uiState.battle.targetBeingSelected.type === TargetType.Land
    ) {
      targetLand(land);
      return;
    }
    if (selectedUnit && isValidTarget) {
      attackLand(selectedUnit, land);
      if (selectedUnit.keywords?.moveAndAttack && !selectedUnit.hasMoved) {
        setUnitsTargets(selectedUnit);
      } else {
        clearSelections();
      }
      return;
    }
    if (land.colors[0] && isHumanPlayer(land.ownerPlayerId)) {
      usePlayerColorAbility(bs.players[land.ownerPlayerId], land.colors[0].color);
    }
  }

  function handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    uiState.cardFullOverlay.visible = true;
    uiState.cardFullOverlay.card = land;
  }
</script>

<div
  class="land {isValidTarget ? 'valid-target' : ''}"
  style="background-image: url('{imagePath}')"
  onclick={handleLandClick}
  oncontextmenu={handleContextMenu}
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
