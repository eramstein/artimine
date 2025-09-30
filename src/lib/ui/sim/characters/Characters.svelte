<script lang="ts">
  import type { Npc } from '@/lib/_model';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import CharacterOverview from './CharacterOverview.svelte';
  import CharacterPortrait from './CharacterPortrait.svelte';

  const characters = $derived(Object.values(gs.characters) as Npc[]);
  let selectedKey: string | null = $state(uiState.selectedCharacterKey);
  const selectedNpc: Npc | null = $derived(
    (characters.find((c) => c.key === selectedKey) as Npc | undefined) ?? null
  );

  $effect(() => {
    if (selectedKey === null && uiState.selectedCharacterKey) {
      selectedKey = uiState.selectedCharacterKey;
    } else if (selectedKey === null && characters.length) {
      selectedKey = characters[0].key;
    }
  });

  function select(npc: Npc) {
    selectedKey = npc.key;
    uiState.selectedCharacterKey = npc.key;
  }
</script>

<div class="characters">
  <div class="sidebar">
    <div class="character-list">
      {#each characters as npc}
        <button
          class="character-row {selectedKey === npc.key ? 'selected' : ''}"
          onclick={() => select(npc)}
        >
          <div class="thumb">
            <CharacterPortrait character={npc} />
          </div>
          <div class="meta">
            <div class="name">{npc.name}</div>
          </div>
        </button>
      {/each}
    </div>
  </div>
  <div class="content">
    {#if selectedNpc}
      <CharacterOverview npc={selectedNpc} />
    {:else}
      <div class="empty">Select a character to view details</div>
    {/if}
  </div>
</div>

<style>
  .characters {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    gap: 0;
    overflow: hidden;
  }

  .sidebar {
    height: 100%;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.85);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .character-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .character-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 6px;
    border-radius: 10px;
    padding: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
  }

  .thumb {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    overflow: hidden;
  }

  .character-row.selected {
    border-color: rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.06);
  }

  .meta .name {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 700;
    font-size: 14px;
    margin-top: 4px;
  }
</style>
