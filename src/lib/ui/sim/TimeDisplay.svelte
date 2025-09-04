<script lang="ts">
  import { gs } from '@/lib/_state/main.svelte';
</script>

<div class="time-display">
  <span class="day">Day {gs.time.day}</span>
  <span class="period">{gs.time.period}</span>
</div>

<style>
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
