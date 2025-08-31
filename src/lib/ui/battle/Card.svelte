<script lang="ts">
  import { DataEffectTemplates } from '@/lib/battle/effects/effect-templates';
  import { CARD_HEIGHT, CARD_WIDTH } from '@lib/_config/ui-config';
  import { CardColor, CardType, TargetType, UnitType } from '@lib/_model/enums';
  import type { Card, SpellCard } from '@lib/_model/model-battle';
  import { uiState } from '@lib/_state';
  import { getAssetPath, getCardImagePath } from '@lib/_utils/asset-paths';
  import { isPayable } from '@lib/battle/cost';
  import { activateSpell, targetCard } from '@lib/ui/_helpers/targetting';
  import Abilities from './Abilities.svelte';
  import Keywords from './Keywords.svelte';
  import Stats from './Stats.svelte';

  let {
    card,
    displayKeywords = true,
    inHand = true,
  }: { card: Card; displayKeywords?: boolean; inHand?: boolean } = $props();

  // Create the background image path using the card id
  let cardImagePath = $derived(getCardImagePath(card.id));

  // Check if this card is the currently pending spell
  let isPendingSpell = $derived(
    uiState.battle.spellPending && uiState.battle.spellPending.instanceId === card.instanceId
  );

  // Calculate font size based on name length
  let nameFontSize = $derived(() => {
    return card.name.length > 20 ? 0.75 : 0.9;
  });

  // Check if card is a unit card (works with Card type)
  function isUnitCard(card: Card): card is Card & {
    power: number;
    maxHealth: number;
    keywords?: any;
    abilities?: any;
    unitTypes?: UnitType[];
  } {
    return card.type === CardType.Unit;
  }

  // Check if card is a spell card
  function isSpellCard(card: Card): card is SpellCard {
    return card.type === CardType.Spell;
  }

  // Determine border color based on whether the card is payable
  function getBorderColor() {
    return isPayable(card) ? 'var(--color-golden)' : '#666'; // Gold if affordable, gray if not
  }

  // Helper function to get color image path
  function getColorImagePath(color: CardColor): string {
    return getAssetPath(`images/color_${color}.png`);
  }

  // Handle card click
  function handleClick() {
    // If selecting a target and it's a hand card, treat this click as target selection
    if (
      inHand &&
      uiState.battle.targetBeingSelected &&
      uiState.battle.targetBeingSelected.type === TargetType.HandCard
    ) {
      targetCard(card);
      return;
    }

    if (inHand && isSpellCard(card) && isPayable(card)) {
      // Check if any effect in the spell has targets
      const hasTargets = card.actions.some((action) => action.targets && action.targets.length > 0);

      if (!hasTargets) {
        uiState.modal.visible = true;
        uiState.modal.title = 'Cast Spell?';
        uiState.modal.body = `Are you sure you want to cast <b>${card.name}</b>?<br><span class='spell-text'>${getSpellText()}</span>`;
        uiState.modal.onConfirm = () => activateSpell(card);
        uiState.modal.onCancel = undefined;
      } else {
        activateSpell(card);
      }
    }
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

  // Drag event handlers
  function handleDragStart(event: DragEvent) {
    if (!isUnitCard(card) || !isPayable(card)) {
      event.preventDefault();
      return;
    }

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/json', JSON.stringify(card));
    }
  }

  function handleDrag(event: DragEvent) {
    // Add visual feedback during drag
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  // Handle right-click to show CardFull
  function handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    uiState.cardFullOverlay.visible = true;
    uiState.cardFullOverlay.card = card;
  }
</script>

<div
  class="card {isPendingSpell ? 'pending-spell' : ''}"
  style="--card-width: {CARD_WIDTH}px; --card-height: {CARD_HEIGHT +
    40}px; border-color: {getBorderColor()}; --name-font-size: {nameFontSize()}rem;"
  draggable={isUnitCard(card) && isPayable(card)}
  ondragstart={handleDragStart}
  ondrag={handleDrag}
  onclick={handleClick}
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
        {#if isUnitCard(card) && card.keywords && displayKeywords}
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
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
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

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
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

  .card:hover .name.has-unit-types {
    padding: 4px 12px;
  }

  .card:hover .name.has-unit-types .name-text {
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

  .card:hover .unit-types-inline {
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
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .keywords-container {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .card:hover .abilities-container,
  .card:hover .keywords-container {
    opacity: 1;
  }

  .card.pending-spell {
    transform: translateY(-20px) scale(1.1);
    border-color: var(--color-golden);
    box-shadow:
      0 0 20px rgba(255, 215, 0, 0.8),
      0 8px 25px rgba(0, 0, 0, 0.5);
    z-index: 10;
    animation: spell-pulse 1s ease-in-out infinite alternate;
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
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .card:hover .spell-effect {
    opacity: 1;
  }

  @keyframes spell-pulse {
    from {
      box-shadow:
        0 0 20px rgba(255, 215, 0, 0.8),
        0 8px 25px rgba(0, 0, 0, 0.5);
    }
    to {
      box-shadow:
        0 0 30px rgba(255, 215, 0, 1),
        0 12px 35px rgba(0, 0, 0, 0.6);
    }
  }
</style>
