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

  <!-- Tooltip portal - all tooltips will be rendered here -->
  <div id="tooltip-portal" class="tooltip-portal"></div>
</div>

<style>
  .tooltip-portal {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    pointer-events: none;
    z-index: 999999;
  }
</style>
