<script lang="ts">
  import { UiView } from '@/lib/_model';
  import { gs, saveStateToLocalStorage } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import { deleteDeck, renameDeck } from '@/lib/sim/decks';
  import Collection from '../Collection.svelte';
  import DeckList from './DeckList.svelte';

  // Get the deck being edited from the editedDeckKey
  let selectedDeck = $derived(
    uiState.collection.editedDeckKey
      ? gs.player.decks.find((deck) => deck.key === uiState.collection.editedDeckKey) || null
      : null
  );

  // State for editing deck name
  let isEditingName = $state(false);
  let tempDeckName = $state('');

  function goBack() {
    uiState.currentView = UiView.Decks;
    uiState.collection.editedDeckKey = null;
    saveStateToLocalStorage();
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

  function handleDeleteDeck() {
    if (!selectedDeck) return;

    const confirmed = confirm(
      `Are you sure you want to delete the deck "${selectedDeck.name}"? This action cannot be undone.`
    );
    if (confirmed) {
      deleteDeck(selectedDeck);
      // Navigate back to decks view after deletion
      uiState.currentView = UiView.Decks;
      uiState.collection.editedDeckKey = null;
    }
  }

  function startEditingName() {
    if (!selectedDeck) return;
    isEditingName = true;
    tempDeckName = selectedDeck.name;
  }

  function saveDeckName() {
    if (!selectedDeck || !tempDeckName.trim()) return;

    const newName = tempDeckName.trim();
    if (newName !== selectedDeck.name) {
      renameDeck(selectedDeck, newName);
      saveStateToLocalStorage();
    }
    isEditingName = false;
  }

  function cancelEditingName() {
    isEditingName = false;
    tempDeckName = '';
  }

  function handleNameKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      saveDeckName();
    } else if (event.key === 'Escape') {
      cancelEditingName();
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
        {#if isEditingName}
          <div class="name-edit-container">
            <input
              type="text"
              bind:value={tempDeckName}
              onkeydown={handleNameKeydown}
              onblur={saveDeckName}
              class="name-input"
              placeholder="Deck name"
              autofocus
            />
            <button class="save-name-button" onclick={saveDeckName} title="Save">✓</button>
            <button class="cancel-name-button" onclick={cancelEditingName} title="Cancel">✗</button>
          </div>
        {:else}
          <div class="name-display-container">
            <span class="current-deck-name" onclick={startEditingName}>{selectedDeck.name}</span>
            <button class="edit-name-button" onclick={startEditingName} title="Edit name">✏️</button
            >
          </div>
        {/if}
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
          <button class="delete-button" onclick={handleDeleteDeck}> 🗑️ Delete Deck </button>
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
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .current-deck-name:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .name-display-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .name-edit-container {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .name-input {
    background: #3a3a3a;
    color: #e0e0e0;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 1.1rem;
    font-weight: bold;
    min-width: 150px;
    outline: none;
  }

  .name-input:focus {
    border-color: #4a9eff;
    box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
  }

  .edit-name-button,
  .save-name-button,
  .cancel-name-button {
    background: transparent;
    border: none;
    color: #888;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
  }

  .edit-name-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
  }

  .save-name-button:hover {
    background-color: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  .cancel-name-button:hover {
    background-color: rgba(239, 68, 68, 0.2);
    color: #ef4444;
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
    overflow: auto;
    min-height: 0;
  }

  .collection-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: auto;
  }

  .deck-panel {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    min-width: 0;
    margin-top: 1rem;
    width: fit-content;
    overflow: auto;
    max-height: 100%;
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

  .delete-button {
    background: #4a5568;
    color: #ccc;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.5rem;
  }

  .delete-button:hover {
    background: #2d3748;
    color: #e0e0e0;
  }

  .delete-button:active {
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

    .delete-button {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
      margin-left: 0.25rem;
    }
  }
</style>
