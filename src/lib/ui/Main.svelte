<script lang="ts">
  import { UiView } from '../_model';
  import { uiState, gs } from '../_state';
  import Battle from './Battle.svelte';
</script>

<div class="main">
  <div class="scene-container">
    {#if uiState.currentView === UiView.Battle}
      <Battle />
    {/if}
  </div>
</div>

<style>
</style>
