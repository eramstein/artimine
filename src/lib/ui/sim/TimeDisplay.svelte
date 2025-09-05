<script lang="ts">
  import { gs } from '@/lib/_state/main.svelte';
</script>

<div class="time-display">
  <span class="day">Day {gs.time.day}</span>
  <span class="period">{gs.time.period}</span>
</div>

<style>
  .time-display {
    display: flex;
    flex-direction: column;
    font-family: 'Arial', sans-serif;
    padding-left: 30px;
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
