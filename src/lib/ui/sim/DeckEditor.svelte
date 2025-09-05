<script lang="ts">
  import { UiView } from '@/lib/_model';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import Collection from './Collection.svelte';
  import DeckList from './DeckList.svelte';

  // For now, we'll use the first deck as a default
  // In the future, this could be passed as a prop or selected from a dropdown
  let selectedDeck = $derived(gs.decks[0] || null);

  function goBack() {
    uiState.currentView = UiView.Decks;
    uiState.collection.editedDeckKey = null;
  }

  async function copyDeckToClipboard() {
    if (!selectedDeck) return;

    try {
      const deckJson = JSON.stringify(selectedDeck, null, 2);
      await navigator.clipboard.writeText(deckJson);
      // You could add a toast notification here if you have one
      console.log('Deck copied to clipboard');
    } catch (err) {
      console.error('Failed to copy deck to clipboard:', err);
    }
  }
</script>

<div class="deck-editor-container">
  <div class="editor-header">
    <div class="header-left">
      <button class="back-button" onclick={goBack}> ← Back to Decks </button>
      <h2 class="editor-title">Deck Editor</h2>
    </div>
    {#if selectedDeck}
      <div class="deck-selector">
        <span class="current-deck-label">Editing:</span>
        <span class="current-deck-name">{selectedDeck.name}</span>
      </div>
    {:else}
      <div class="no-deck-selected">
        <span>No deck selected</span>
      </div>
    {/if}
  </div>

  <div class="editor-content">
    <div class="collection-panel">
      <Collection />
    </div>

    <div class="deck-panel">
      {#if selectedDeck}
        <DeckList deck={selectedDeck} />
        <div class="deck-actions">
          <button class="copy-button" onclick={copyDeckToClipboard}> 📋 Copy JSON </button>
        </div>
      {:else}
        <div class="no-deck-message">
          <p>Select a deck to edit from the Decks view</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .deck-editor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #1a1a1a;
    color: white;
  }

  .editor-header {
    background: #2a2a2a;
    border-bottom: 1px solid #444;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .back-button {
    background: #4a5568;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    white-space: nowrap;
  }

  .back-button:hover {
    background: #2d3748;
  }

  .back-button:active {
    background: #1a202c;
  }

  .editor-title {
    font-size: 1.8rem;
    font-weight: bold;
    margin: 0;
    color: #e0e0e0;
  }

  .deck-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .current-deck-label {
    color: #888;
    font-size: 0.9rem;
  }

  .current-deck-name {
    color: #e0e0e0;
    font-weight: bold;
    font-size: 1.1rem;
  }

  .no-deck-selected {
    color: #888;
    font-style: italic;
  }

  .editor-content {
    display: flex;
    flex: 1;
    gap: 2rem;
    padding: 5px 2rem;
    overflow: hidden;
  }

  .collection-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .deck-panel {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    min-width: 0;
    margin-top: 1rem;
    width: fit-content;
  }

  .no-deck-message {
    text-align: center;
    padding: 2rem;
    color: #888;
  }

  .no-deck-message p {
    margin: 0;
    font-size: 1rem;
  }

  .deck-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .copy-button {
    background: #4a5568;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .copy-button:hover {
    background: #2d3748;
  }

  .copy-button:active {
    background: #1a202c;
  }

  @media (max-width: 1024px) {
    .editor-content {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .collection-panel,
    .deck-panel {
      flex: none;
    }

    .editor-header {
      padding: 1rem;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }
  }

  @media (max-width: 768px) {
    .editor-content {
      padding: 0.5rem;
    }

    .editor-header {
      padding: 0.5rem;
    }

    .editor-title {
      font-size: 1.5rem;
    }

    .copy-button {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }
  }
</style>
