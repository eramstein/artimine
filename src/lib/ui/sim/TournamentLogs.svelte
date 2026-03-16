<script lang="ts">
  import { gs } from '@/lib/_state/main.svelte';

  const getPlaceName = (index: number) => gs.places[index]?.name || 'Unknown';
  
  const getWinnerName = (key: string) => {
    if (key === gs.player.key) return gs.player.name;
    return gs.characters[key]?.name || 'Unknown';
  };
</script>

<div class="tournament-logs">
  <div class="header-row">
    <h2>Tournament History</h2>
    <div class="stats">
      Total Tournaments: {gs.tournamentLogs.length}
    </div>
  </div>
  
  <div class="logs-grid">
    <div class="header">Day</div>
    <div class="header">Location</div>
    <div class="header">Format</div>
    <div class="header">Winner</div>

    {#each gs.tournamentLogs as log}
      <div class="cell">{log.day}</div>
      <div class="cell">{getPlaceName(log.place)}</div>
      <div class="cell">{log.type}</div>
      <div class="cell winner" class:is-player={log.winner === gs.player.key}>
        {getWinnerName(log.winner)}
      </div>
    {/each}

    {#if gs.tournamentLogs.length === 0}
      <div class="empty-state">No tournaments recorded yet.</div>
    {/if}
  </div>
</div>

<style>
  .tournament-logs {
    padding: 40px;
    color: white;
    max-width: 900px;
    margin: 0 auto;
    height: 100%;
    overflow-y: auto;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(255, 215, 0, 0.3);
    padding-bottom: 12px;
  }

  h2 {
    margin: 0;
    color: #ffd700;
    font-size: 28px;
    font-family: 'Cinzel', serif; /* Assuming a fantasy font might be available or generic serif */
  }

  .stats {
    font-size: 14px;
    color: rgba(255, 215, 0, 0.7);
    font-weight: bold;
  }

  .logs-grid {
    display: grid;
    grid-template-columns: 80px 1fr 140px 1fr;
    gap: 1px;
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 4px;
    overflow: hidden;
  }

  .header {
    background: rgba(30, 30, 30, 0.9);
    padding: 14px;
    font-weight: bold;
    color: #ffd700;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.1em;
  }

  .cell {
    background: rgba(20, 20, 20, 0.8);
    padding: 14px;
    display: flex;
    align-items: center;
    font-size: 15px;
  }

  .winner {
    font-weight: bold;
    color: #fff;
  }

  .winner.is-player {
    color: #ffd700;
    text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
  }

  .empty-state {
    grid-column: 1 / -1;
    background: rgba(20, 20, 20, 0.8);
    padding: 60px;
    text-align: center;
    color: rgba(255, 255, 255, 0.3);
    font-style: italic;
    font-size: 18px;
  }
</style>
