<script lang="ts">
  import { UiView } from '@/lib/_model';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import Chat from '../Chat.svelte';
  import CharacterPortrait from './CharacterPortrait.svelte';
  import RelationBars from './RelationBars.svelte';

  const characters = $derived(gs.chat ? (gs.chat.characters ?? []) : []);

  // Auto-switch back to CurrentPlace when chat ends
  $effect(() => {
    if (!gs.chat && uiState.currentView === UiView.Chat) {
      uiState.currentView = UiView.CurrentPlace;
    }
  });
</script>

{#if gs.chat}
  <div class="character-interaction">
    <div class="sidebar">
      <div class="character-list">
        {#each characters as character}
          <div class="character-item">
            <div class="portrait">
              <CharacterPortrait {character} />
            </div>
            <div class="character-info">
              <div class="name">{character.name}</div>
              <div class="relation-summary">{character.relationSummary}</div>
            </div>

            <div class="opinion-section">
              <div class="opinion-title">Opinion</div>
              <RelationBars
                values={character.relationValues}
                labelMinWidthPx={60}
                barWidthPx={null}
                fontSizePx={10}
              />
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="content">
      <div class="chat-host">
        <Chat />
      </div>
    </div>
  </div>
{:else}
  <div class="character-interaction empty">
    <div class="content">
      <div class="chat-host">
        <Chat />
      </div>
    </div>
  </div>
{/if}

<style>
  .character-interaction {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    gap: 0;
    overflow: hidden;
  }

  .character-interaction.empty {
    flex-direction: column;
  }

  .sidebar {
    width: 320px;
    min-width: 280px;
    max-width: 360px;
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
    gap: 16px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .character-item {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
  }

  .portrait {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 12px;
    overflow: hidden;
  }

  .character-info {
    margin-top: 10px;
    text-align: center;
  }

  .name {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 6px;
  }

  .relation-summary {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    line-height: 1.3;
    font-style: italic;
  }

  .opinion-section {
    margin-top: 12px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .opinion-title {
    color: rgba(255, 255, 255, 0.9);
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .content {
    flex: 1 1 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px;
    box-sizing: border-box;
    overflow: hidden;
    min-height: 0;
  }

  /* Ensure Chat fills available height and scrolls internally */
  .chat-host {
    flex: 1 1 auto;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }

  /* Ensure the Chat container stretches within the host */
  :global(.chat-host > .chat-container) {
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: 0;
  }
</style>
