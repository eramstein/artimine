<script lang="ts">
  import { gs } from '@/lib/_state/main.svelte';
</script>

<div class="player-sheet">
  <h2 class="player-name">{gs.player.name}</h2>
  <div class="character-stats">
    <div class="stat-item">
      <span class="stat-label">INT</span>
      <span class="stat-value">{gs.player.attributes.intelligence}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">CHA</span>
      <span class="stat-value">{gs.player.attributes.charisma}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">VIT</span>
      <span class="stat-value">{gs.player.attributes.vitality}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">DEX</span>
      <span class="stat-value">{gs.player.attributes.dexterity}</span>
    </div>
  </div>
  <div class="player-stats">
    <div class="stat-row">
      <span class="label">Cash</span>
      <span class="value">{gs.player.cash}$</span>
    </div>
    <div class="stat-row">
      <span class="label">Study Points</span>
      <span class="value">{gs.player.studyPoints}</span>
    </div>
  </div>
</div>

<style>
  .player-sheet {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    color: #fff;
  }

  .player-name {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  .character-stats {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 8px;
    width: fit-content;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 32px;
  }

  .stat-label {
    font-size: 10px;
    opacity: 0.7;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
  }

  .player-stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 8px 12px;
  }

  .label {
    opacity: 0.8;
  }

  .value {
    font-weight: 600;
  }
</style>
