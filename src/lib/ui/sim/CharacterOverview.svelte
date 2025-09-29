<script lang="ts">
  import type { Npc } from '@/lib/_model';
  import type { Deck, RelationshipSummaryUpdate } from '@/lib/_model/model-game';
  import { gs } from '@/lib/_state';
  import { getRelationshipSummaryUpdates } from '@/lib/llm/memories-db';
  import CharacterPortrait from './CharacterPortrait.svelte';
  import DeckList from './DeckList.svelte';

  let { npc }: { npc: Npc } = $props();

  function getRelationColor(value: number): string {
    const normalized = (value + 10) / 20;
    if (normalized <= 0.5) {
      const t = normalized * 2;
      const r = Math.round(255);
      const g = Math.round(255 * t);
      const b = Math.round(68 * t);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const t = (normalized - 0.5) * 2;
      const r = Math.round(255 * (1 - t));
      const g = Math.round(255);
      const b = Math.round(68 + 187 * t);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  const decks = $derived(npc.decks ?? []);
  let selectedDeck: Deck | null = $state(null);

  let showHistory = $state(false);
  let history = $state<RelationshipSummaryUpdate[] | null>(null);

  async function loadHistory() {
    try {
      const start = 0;
      const end = gs.time.day;
      const updates = await getRelationshipSummaryUpdates(npc.key, start, end);
      // Sort by day ascending
      history = updates.sort((a, b) => a.day - b.day);
    } catch (err) {
      console.error('Failed to load relationship history', err);
      history = [];
    }
  }

  $effect(() => {
    if (showHistory && history === null) {
      void loadHistory();
    }
  });
</script>

<div class="character-overview">
  <div class="header">
    <div class="portrait">
      <CharacterPortrait character={npc} />
    </div>
    <div class="identity">
      <div class="name">{npc.name}</div>
      <div class="bio-container">
        <div class="bio">{npc.bio}</div>
        <div class="relation-values">
          <div class="relation-bar">
            <span class="relation-label">Friendship</span>
            <div class="bar-container">
              <div
                class="bar-fill"
                style="width: {Math.max(
                  0,
                  ((npc.relationValues.friendship + 10) / 20) * 100
                )}%; background: {getRelationColor(npc.relationValues.friendship)}"
              ></div>
            </div>
            <span class="relation-value">{npc.relationValues.friendship}</span>
          </div>
          <div class="relation-bar">
            <span class="relation-label">Respect</span>
            <div class="bar-container">
              <div
                class="bar-fill"
                style="width: {Math.max(
                  0,
                  ((npc.relationValues.respect + 10) / 20) * 100
                )}%; background: {getRelationColor(npc.relationValues.respect)}"
              ></div>
            </div>
            <span class="relation-value">{npc.relationValues.respect}</span>
          </div>
          <div class="relation-bar">
            <span class="relation-label">Love</span>
            <div class="bar-container">
              <div
                class="bar-fill"
                style="width: {Math.max(
                  0,
                  ((npc.relationValues.love + 10) / 20) * 100
                )}%; background: {getRelationColor(npc.relationValues.love)}"
              ></div>
            </div>
            <span class="relation-value">{npc.relationValues.love}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="relations">
    <div class="section-title">Relations</div>
    <div class="relation-summary">{npc.relationSummary}</div>
    <div class="history-controls">
      <button class="history-toggle" onclick={() => (showHistory = !showHistory)}>
        {showHistory ? 'Hide history' : 'Show history'}
      </button>
    </div>

    {#if showHistory}
      {#if history === null}
        <div class="history-loading">Loading…</div>
      {:else if history.length === 0}
        <div class="history-empty">No past changes yet.</div>
      {:else}
        <ul class="history-list">
          {#each history as item}
            <li class="history-item">
              <span class="history-day">Day {item.day}</span>
              <span class="history-desc">{item.description}</span>
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </div>

  <div class="decks">
    <div class="section-title">Decks</div>
    <div class="decks-content">
      {#if decks.length === 0}
        <div class="empty">No decks yet.</div>
      {:else}
        <ul class="deck-list">
          {#each decks as deck}
            <li
              class="deck-item {selectedDeck && selectedDeck.key === deck.key ? 'selected' : ''}"
              onclick={() =>
                selectedDeck && selectedDeck.key === deck.key
                  ? (selectedDeck = null)
                  : (selectedDeck = deck)}
            >
              <span class="deck-name">{deck.name}</span>
              <span class="deck-record">{deck.record.wins}-{deck.record.losses}</span>
            </li>
          {/each}
        </ul>
      {/if}

      {#if selectedDeck}
        <div class="deck-preview">
          <DeckList deck={selectedDeck} />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .character-overview {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 12px;
  }

  .header {
    display: grid;
    grid-template-columns: 160px 1fr 220px;
    gap: 16px;
    align-items: start;
  }

  .portrait {
    width: 160px;
    aspect-ratio: 1 / 1;
    border-radius: 12px;
    overflow: hidden;
  }

  .bio-container {
    display: flex;
    gap: 50px;
  }

  .identity .name {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 800;
    font-size: 20px;
    margin-bottom: 6px;
  }

  .identity .bio {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 8px;
    width: 600px;
  }

  .relation-summary {
    color: rgba(255, 255, 255, 0.7);
    max-width: 1200px;
  }

  .section-title {
    color: rgba(255, 255, 255, 0.9);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  .history-controls {
    margin: 6px 0 4px;
  }

  .history-toggle {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
  }

  .history-list {
    list-style: none;
    margin: 6px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 820px;
  }

  .history-item {
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: 8px;
    align-items: start;
    padding: 6px 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
  }

  .history-day {
    color: rgba(255, 255, 255, 0.75);
    font-variant-numeric: tabular-nums;
  }

  .history-desc {
    color: rgba(255, 255, 255, 0.92);
  }

  .history-loading,
  .history-empty {
    color: rgba(255, 255, 255, 0.7);
    font-style: italic;
    font-size: 12px;
  }

  .relation-values {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .relation-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }

  .relation-label {
    color: rgba(255, 255, 255, 0.8);
    min-width: 72px;
    text-align: left;
  }

  .bar-container {
    width: 200px;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .relation-value {
    color: rgba(255, 255, 255, 0.9);
    min-width: 24px;
    text-align: right;
    font-weight: 600;
  }

  .deck-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 200px;
  }

  .deck-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
  }

  .deck-item.selected {
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.08);
  }

  .deck-name {
    color: rgba(255, 255, 255, 0.92);
    font-weight: 600;
  }

  .deck-record {
    color: rgba(255, 255, 255, 0.8);
    font-variant-numeric: tabular-nums;
  }

  .decks {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .decks-content {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 16px;
    align-items: start;
  }

  .deck-preview {
    min-width: 0;
    overflow: hidden;
  }

  .empty {
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
  }
</style>
