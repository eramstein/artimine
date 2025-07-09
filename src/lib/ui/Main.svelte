<script lang="ts">
  import { UiView } from '../_model';
  import { uiState, bs } from '../_state';
  import Battle from './Battle.svelte';
</script>

<div class="main">
  <div class="scene-container">
    {#if uiState.currentView === UiView.Battle && bs.turn > 0}
      <Battle />
    {/if}
  </div>
</div>

<style>
</style>
