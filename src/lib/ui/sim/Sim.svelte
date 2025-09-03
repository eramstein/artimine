<script lang="ts">
  import { UiView } from '@/lib/_model';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import Place from './Place.svelte';
</script>

<div class="sim-container">
  <div class="time-display">
    <span class="day">Day {gs.time.day}</span>
    <span class="period">{gs.time.period}</span>
  </div>

  <div class="current-view">
    {#if uiState.currentView === UiView.CurrentPlace}
      <Place place={gs.places[gs.player.place]} />
    {/if}
  </div>
</div>

<style>
  .sim-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    color: white;
  }

  .current-view {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .time-display {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: 'Arial', sans-serif;
    z-index: 10;
  }

  .day {
    font-size: 18px;
    font-weight: bold;
    color: #ffd700;
  }

  .period {
    font-size: 14px;
    color: #cccccc;
    text-transform: capitalize;
  }
</style>
