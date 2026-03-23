<script lang="ts">
  import type { Ambition } from '@/lib/_model/model-game';

  let { ambitions }: { ambitions: Ambition[] } = $props();
</script>

<div class="ambitions-list">
  {#if !ambitions || ambitions.length === 0}
    <div class="empty">No ambitions yet.</div>
  {:else}
    {#each ambitions as ambition}
      <div class="ambition-item">
        <div class="ambition-summary">{ambition.summary}</div>
        <div class="ambition-state">{ambition.currentState}</div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .ambitions-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 820px;
  }

  .ambition-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
  }

  .ambition-summary {
    color: rgba(255, 255, 255, 0.92);
    font-weight: 600;
  }

  .ambition-state {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    line-height: 1.4;
  }

  .empty {
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    font-size: 12px;
  }
</style>
