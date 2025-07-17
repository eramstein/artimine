<script lang="ts">
  import { config } from '@lib/_config';
  import Land from './Land.svelte';
  import UnitDeployed from './UnitDeployed.svelte';
  import { bs, uiState } from '@lib/_state';
  import { deployUnit } from '@lib/battle/unit';
  import { isUnitCard, type UnitCardTemplate } from '@lib/_model';
  import type { Position, Card } from '@lib/_model';
  import { isOnPlayersSide, getPositionKey } from '../battle/boards';
  import { moveUnit } from '../battle/move';
  import { clearSelections, setValidTargets, toggleUnitSelection } from './_helpers/selections';
  import { fly } from 'svelte/transition';
  import { restoreUnitFunctions } from '@lib/_state/main.svelte';

  // Create arrays for rows and columns based on config
  const rows = Array.from({ length: config.boardRows }, (_, i) => i);
  const columns = Array.from({ length: config.boardColumns }, (_, i) => i);

  // Calculate the middle column index for the gap
  const middleColumnIndex = Math.floor(config.boardColumns / 2) - 1;

  // Get lands from battle state
  const leftLands = $derived(bs.players[0]?.lands || []);
  const rightLands = $derived(bs.players[1]?.lands || []);

  // Create maps of position to land for efficient lookup
  const leftLandsByPosition = $derived(() => {
    const map = new Map<number, (typeof leftLands)[0]>();
    for (const land of leftLands) {
      map.set(land.position, land);
    }
    return map;
  });

  const rightLandsByPosition = $derived(() => {
    const map = new Map<number, (typeof rightLands)[0]>();
    for (const land of rightLands) {
      map.set(land.position, land);
    }
    return map;
  });

  // Function to get land at a specific position
  function getLeftLandAtPosition(position: number) {
    return leftLandsByPosition().get(position);
  }

  function getRightLandAtPosition(position: number) {
    return rightLandsByPosition().get(position);
  }

  // Track drag state for each cell
  let dragOverCell = $state<{ row: number; column: number } | null>(null);

  // Drop event handlers
  function handleDragOver(event: DragEvent) {
    // Only allow drops during player's turn
    if (!bs.isPlayersTurn) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  function handleDragEnter(event: DragEvent, row: number, column: number) {
    // Only show visual feedback during player's turn
    if (!bs.isPlayersTurn) return;
    dragOverCell = { row, column };
  }

  function handleDragLeave(event: DragEvent, row: number, column: number) {
    // Only clear if we're leaving the current drag-over cell
    if (dragOverCell?.row === row && dragOverCell?.column === column) {
      dragOverCell = null;
    }
  }

  function handleDrop(event: DragEvent, row: number, column: number) {
    event.preventDefault();
    dragOverCell = null;
    if (!event.dataTransfer) return;
    try {
      const cardData = event.dataTransfer.getData('application/json');
      if (!cardData) return;
      const position: Position = { row, column };
      const card: Card = JSON.parse(cardData);
      restoreUnitFunctions(card as UnitCardTemplate);
      if (isUnitCard(card) && isOnPlayersSide(position, card.ownerPlayerId)) {
        deployUnit(card, position);
        if (card.keywords?.haste) {
          toggleUnitSelection(bs.units[bs.units.length - 1]);
        }
      }
    } catch (error) {
      console.error('Error deploying unit:', error);
    }
  }

  // Function to check if a position is a valid move target
  function isValidMoveTarget(row: number, column: number) {
    const positionKey = getPositionKey({ row, column });
    return uiState.battle.validTargets?.moves?.[positionKey] === true;
  }

  // Function to calculate unit position in pixels
  function getUnitPosition(unit: (typeof bs.units)[0]) {
    // +1 column to account for the left player lands, 8 for the gap with lands, 4 time column for the gap between units, +20 if over middle gap
    const left =
      (unit.position.column + 1) * 144 +
      8 +
      unit.position.column * 4 +
      (unit.position.column > middleColumnIndex ? 20 : 0);
    const top = unit.position.row * (144 + 4);
    return { left, top };
  }

  // Click handler for board cells
  function handleCellClick(row: number, column: number) {
    const selectedUnit = uiState.battle.selectedUnit;
    if (selectedUnit && isValidMoveTarget(row, column)) {
      const targetPosition: Position = { row, column };
      moveUnit(selectedUnit, targetPosition);
      if (selectedUnit.keywords?.moveAndAttack && !selectedUnit.hasAttacked) {
        setValidTargets(selectedUnit);
      } else {
        clearSelections();
      }
    }
  }
</script>

<div class="board-container">
  <!-- Left column -->
  <div class="side-column left-column">
    {#each rows as row}
      <div class="side-cell" data-row={row} data-side="left">
        {#if getLeftLandAtPosition(row)}
          <Land land={getLeftLandAtPosition(row)!} />
        {/if}
      </div>
    {/each}
  </div>

  <!-- Main board -->
  <div class="board" style="--middle-column: {middleColumnIndex}">
    {#each rows as row}
      <div class="board-row">
        {#each columns as column}
          <div
            class="board-cell"
            class:middle-gap={column === middleColumnIndex}
            class:drag-over={dragOverCell?.row === row && dragOverCell?.column === column}
            class:valid-move-target={isValidMoveTarget(row, column)}
            data-row={row}
            data-column={column}
            ondragover={handleDragOver}
            ondragenter={(event) => handleDragEnter(event, row, column)}
            ondragleave={(event) => handleDragLeave(event, row, column)}
            ondrop={(event) => handleDrop(event, row, column)}
            onclick={() => handleCellClick(row, column)}
          ></div>
        {/each}
      </div>
    {/each}
  </div>

  <!-- Right column -->
  <div class="side-column right-column">
    {#each rows as row}
      <div class="side-cell" data-row={row} data-side="right">
        {#if getRightLandAtPosition(row)}
          <Land land={getRightLandAtPosition(row)!} />
        {/if}
      </div>
    {/each}
  </div>
  {#each bs.units as unit (unit.instanceId)}
    {@const position = getUnitPosition(unit)}
    {@const isAiUnit = unit.ownerPlayerId === 1}
    <div
      class="unit-container"
      style="left: {position.left}px; top: {position.top}px;"
      in:fly={isAiUnit ? { y: 0, x: 200, duration: 600 } : undefined}
    >
      <UnitDeployed {unit} />
    </div>
  {/each}
</div>

<style>
  .board-container {
    position: relative;
    display: flex;
    gap: 8px;
  }

  .side-column {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .side-cell {
    width: 140px;
    height: 140px;
    background: #2a2a2a;
    border: 2px solid transparent;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .side-cell:hover {
    background: #3a3a3a;
    border-color: #777;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .side-cell:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .board {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .board-row {
    display: flex;
    gap: 4px;
  }

  .board-cell.middle-gap {
    margin-right: 20px;
  }

  .board-cell {
    width: 140px;
    height: 140px;
    background: #3a3a3a;
    border: 2px solid #555;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .board-cell:hover {
    background: #4a4a4a;
    border-color: #666;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .board-cell:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .board-cell.drag-over {
    background: #5a5a5a;
    border-color: #bfa14a;
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(191, 161, 74, 0.6);
  }

  .board-cell.valid-move-target {
    border-color: #4caf50; /* Green border for valid move targets */
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
  }

  .unit-container {
    position: absolute;
    width: 138px;
    height: 138px;
    pointer-events: auto;
    z-index: 10;
    transition:
      left 0.3s ease,
      top 0.3s ease;
  }
</style>
