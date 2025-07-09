<script lang="ts">
  import { config } from '@lib/_config';

  // Create arrays for rows and columns based on config
  const rows = Array.from({ length: config.boardRows }, (_, i) => i);
  const columns = Array.from({ length: config.boardColumns }, (_, i) => i);

  // Calculate the middle column index for the gap
  const middleColumnIndex = Math.floor(config.boardColumns / 2) - 1;
</script>

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

<style>
  .board {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px;
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
