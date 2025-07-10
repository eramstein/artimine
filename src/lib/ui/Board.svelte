<script lang="ts">
  import { config } from '@lib/_config';
  import Land from './Land.svelte';
  import { bs } from '@lib/_state';

  // Create arrays for rows and columns based on config
  const rows = Array.from({ length: config.boardRows }, (_, i) => i);
  const columns = Array.from({ length: config.boardColumns }, (_, i) => i);

  // Calculate the middle column index for the gap
  const middleColumnIndex = Math.floor(config.boardColumns / 2) - 1;

  // Get lands from battle state
  const leftLands = $derived(bs.players[0]?.lands || []);
  const rightLands = $derived(bs.players[1]?.lands || []);
</script>

<div class="board-container">
  <!-- Left column -->
  <div class="side-column left-column">
    {#each rows as row}
      <div class="side-cell" data-row={row} data-side="left">
        {#if leftLands[row]}
          <Land land={leftLands[row]} />
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
            data-row={row}
            data-column={column}
          >
            <!-- Cards will be placed here later -->
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <!-- Right column -->
  <div class="side-column right-column">
    {#each rows as row}
      <div class="side-cell" data-row={row} data-side="right">
        {#if rightLands[row]}
          <Land land={rightLands[row]} />
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .board-container {
    display: flex;
    gap: 8px;
    padding: 0 16px;
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
</style>
