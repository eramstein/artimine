<script lang="ts">
  import { CardColor, CardType } from '@/lib/_model/enums-battle';
  import { DataEffectTemplates } from '@/lib/battle/effects/effect-templates';
  import { CARD_HEIGHT, CARD_WIDTH } from '@lib/_config/ui-config';
  import type { CardTemplate, SpellCardTemplate, UnitCardTemplate } from '@lib/_model/model-battle';
  import { uiState } from '@lib/_state';
  import { getAssetPath, getCardImagePath } from '@lib/_utils/asset-paths';
  import Abilities from '../battle/Abilities.svelte';
  import Keywords from '../battle/Keywords.svelte';
  import Stats from '../battle/Stats.svelte';

  let { card }: { card: CardTemplate } = $props();

  // Create the background image path using the card id
  let cardImagePath = $derived(getCardImagePath(card.id));

  // Calculate font size based on name length
  let nameFontSize = $derived(() => {
    return card.name.length > 20 ? 0.75 : 0.9;
  });

  // Helper function to get color image path
  function getColorImagePath(color: CardColor): string {
    return getAssetPath(`images/color_${color}.png`);
  }

  function isSpellCard(card: CardTemplate): card is SpellCardTemplate {
    return card.type === CardType.Spell;
  }

  function isUnitCard(card: CardTemplate): card is UnitCardTemplate {
    return card.type === CardType.Unit;
  }

  // Get concatenated text from all actions
  function getSpellText(): string {
    if (isSpellCard(card)) {
      let label = '';
      card.actions.forEach((action) => {
        label +=
          DataEffectTemplates[action.effect.name](action.effect.args).label(action.targets || []) +
          '\n';
      });
      return label;
    }
    return '';
  }

  // Handle right-click to show CardFull
  function handleContextMenu(event: MouseEvent) {
    if (uiState.collection.editedDeckKey) {
      return;
    }
    event.preventDefault();
    uiState.cardFullOverlay.visible = true;
    uiState.cardFullOverlay.card = card;
  }
</script>

<div
  class="card"
  style="--card-width: {CARD_WIDTH}px; --card-height: {CARD_HEIGHT +
    40}px; --name-font-size: {nameFontSize()}rem;"
  oncontextmenu={handleContextMenu}
>
  <!-- Card name bar with integrated cost -->
  <div
    class="name {isUnitCard(card) && card.unitTypes && card.unitTypes.length > 0
      ? 'has-unit-types'
      : ''}"
  >
    <div class="cost">
      {card.cost}
    </div>
    <div class="name-content">
      <span class="name-text">{card.name}</span>
      <!-- Unit types display - only for Unit cards with unitTypes -->
      {#if isUnitCard(card) && card.unitTypes && card.unitTypes.length > 0}
        <div class="unit-types-inline">
          {#each card.unitTypes as unitType}
            <span class="unit-type-text">{unitType}</span>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Content area with card image background -->
  <div class="content" style="background-image: url('{cardImagePath}');">
    <!-- Color indicators at the top -->
    <div class="colors">
      {#each card.colors as colorInfo}
        <div class="color-stack" title="{colorInfo.color} ({colorInfo.count})">
          {#each Array(colorInfo.count) as _, index}
            <div
              class="color-indicator"
              style="background-image: url('{getColorImagePath(
                colorInfo.color
              )}'); z-index: {index + 1}; top: {index * 10}px;"
            ></div>
          {/each}
        </div>
      {/each}
    </div>

    <!-- Bottom section with abilities and bottom row -->
    <div class="bottom-section">
      <!-- Abilities display - only for Unit cards with abilities -->
      {#if isUnitCard(card) && card.abilities && card.abilities.length > 0}
        <div class="abilities-container">
          <Abilities abilities={card.abilities} />
        </div>
      {/if}

      <!-- Bottom row: stats on left, keywords on right -->
      <div class="bottom-row">
        <!-- Stats display - only for Unit cards -->
        {#if isUnitCard(card)}
          <Stats power={card.power} health={card.maxHealth} />
        {/if}

        <!-- Keywords display - only for Unit cards with keywords -->
        {#if isUnitCard(card) && card.keywords}
          <div class="keywords-container">
            <Keywords keywords={card.keywords} />
          </div>
        {/if}
      </div>
    </div>

    <!-- Spell effect display for SpellCard -->
    {#if isSpellCard(card)}
      <div class="spell-effect">{getSpellText()}</div>
    {/if}
  </div>
</div>

<style>
  .card {
    width: var(--card-width);
    height: var(--card-height);
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    border: 2px solid #bfa14a;
    --left-margin: 12px;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
  }

  .content {
    flex: 1;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 8px var(--left-margin);
    overflow: hidden;
    border-radius: 0 0 10px 10px;
  }

  .card:active {
    transform: scale(0.95);
  }

  .name {
    background: #000;
    color: white;
    padding: 8px 12px;
    font-weight: bold;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    border-radius: 10px 10px 0 0;
  }

  .name.has-unit-types {
    padding: 4px 12px;
  }

  .name.has-unit-types .name-text {
    font-size: 0.85rem;
  }

  .name-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .unit-types-inline {
    display: none;
    flex-wrap: wrap;
    margin-left: 8px;
    margin-top: -2px;
  }

  .unit-types-inline {
    display: flex;
  }

  .unit-type-text {
    color: #999;
    font-size: 0.65rem;
    font-weight: normal;
    text-transform: capitalize;
  }

  .cost {
    background: radial-gradient(ellipse at 60% 40%, #444 60%, #222 100%);
    color: white;
    border: 1px solid #bfa14a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    padding: 2px 4px;
    border-radius: 50%;
    font-weight: bold;
    font-size: 0.9rem;
    min-width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-shadow: 0 1px 2px #000;
    flex-shrink: 0;
    top: 8px;
    left: var(--left-margin);
  }

  .colors {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .color-stack {
    position: relative;
    height: 28px;
    margin-bottom: 4px;
  }

  .bottom-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .color-indicator {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid var(--color-golden);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .name-text {
    padding-left: 8px;
    font-size: var(--name-font-size, 0.9rem);
    line-height: 1.1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .abilities-container {
    display: flex;
    justify-content: flex-end;
  }

  .spell-effect {
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    line-height: 1.2;
    text-align: center;
    border: 1px solid var(--color-golden);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    margin-top: auto;
    margin-bottom: 4px;
    max-width: 100%;
    word-wrap: break-word;
  }
</style>
