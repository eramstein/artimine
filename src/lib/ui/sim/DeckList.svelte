<script lang="ts">
  import { cards, lands } from '@/data/loader';
  import type { CardColor, Deck } from '@/lib/_model';
  import { getAssetPath } from '@/lib/_utils/asset-paths';
  import { removeCardFromDeck } from '@/lib/sim/decks';

  interface Props {
    deck: Deck;
  }

  let { deck }: Props = $props();

  // Create sorted cards array by mana cost ascending
  let sortedCards = $derived(
    [...deck.cards].sort((a, b) => {
      const costA = getCardCost(a.cardTemplateId);
      const costB = getCardCost(b.cardTemplateId);
      return costA - costB;
    })
  );

  // Function to get card name from ID
  function getCardName(cardId: string): string {
    return cards[cardId]?.name || cardId;
  }

  // Function to get land name from ID
  function getLandName(landId: string): string {
    return lands[landId]?.name || landId;
  }

  // Function to get card cost
  function getCardCost(cardId: string): number {
    return cards[cardId]?.cost || 0;
  }

  // Function to get card colors
  function getCardColors(cardId: string): { color: CardColor; count: number }[] {
    return cards[cardId]?.colors || [];
  }

  // Helper function to get color image path
  function getColorImagePath(color: CardColor): string {
    return getAssetPath(`images/color_${color}.png`);
  }
</script>

<div class="deck-list-container">
  <div class="cards-section">
    <div class="section-title">
      Cards ({deck.cards.reduce((total, card) => total + card.count, 0)})
    </div>
    {#if deck.cards.length === 0}
      <div class="no-cards">
        <p>This deck has no cards.</p>
      </div>
    {:else}
      <div class="cards-list">
        {#each sortedCards as card}
          <div class="card-item" onclick={() => removeCardFromDeck(deck, card.cardTemplateId)}>
            <span class="card-count">×{card.count}</span>
            <span class="card-name">{getCardName(card.cardTemplateId)}</span>
            <span class="card-details">
              {#if getCardColors(card.cardTemplateId).length > 0}
                <div class="color-requirements">
                  {#each getCardColors(card.cardTemplateId) as colorInfo}
                    <div class="color-stack" title="{colorInfo.color} ({colorInfo.count})">
                      {#each Array(colorInfo.count) as _, index}
                        <div
                          class="color-indicator"
                          style="background-image: url('{getColorImagePath(colorInfo.color)}');"
                        ></div>
                      {/each}
                    </div>
                  {/each}
                </div>
              {/if}
              <span class="mana-cost">{getCardCost(card.cardTemplateId)}</span>
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if deck.lands && deck.lands.length > 0}
    <div class="lands-section">
      <div class="section-title">Lands</div>
      <div class="lands-list">
        {#each deck.lands as land}
          <div class="card-item">
            <span class="card-name">{getLandName(land)}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .deck-list-container {
    color: white;
    max-width: 400px;
  }

  .no-cards {
    text-align: center;
    padding: 2rem 1rem;
    color: #888;
  }

  .no-cards p {
    margin: 0;
    font-size: 1rem;
  }

  .cards-section {
    margin-bottom: 0.5rem;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 1rem;
  }

  .lands-section {
    margin-top: 1rem;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 1rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: bold;
    color: #cfcfcf;
    margin-bottom: 0.5rem;
  }

  .card-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #3a3a3a;
    transition: background-color 0.2s ease;
  }

  .card-item:hover {
    background: #333;
    margin: 0 -0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    border-radius: 4px;
  }

  .card-item:last-child {
    border-bottom: none;
  }

  .card-count {
    font-size: 0.9rem;
    color: #888;
    font-weight: bold;
    min-width: 2rem;
    text-align: left;
  }

  .card-name {
    font-size: 0.95rem;
    color: #d0d0d0;
    flex: 1;
    text-transform: capitalize;
    word-break: break-word;
    margin: 0 0.5rem;
  }

  .card-details {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    min-width: 3rem;
  }

  .mana-cost {
    font-size: 0.9rem;
    color: #4a9eff;
    font-weight: bold;
  }

  .color-requirements {
    display: flex;
    gap: 2px;
  }

  .color-stack {
    position: relative;
    display: flex;
    align-items: center;
  }

  .color-indicator {
    width: 16px;
    height: 16px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    .deck-list-container {
      max-width: 100%;
      margin: 0 1rem;
    }

    .card-name {
      font-size: 0.9rem;
    }

    .card-count {
      font-size: 0.85rem;
    }

    .mana-cost {
      font-size: 0.85rem;
    }

    .color-indicator {
      width: 14px;
      height: 14px;
    }
  }
</style>
