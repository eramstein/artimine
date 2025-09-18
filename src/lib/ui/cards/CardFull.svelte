<script lang="ts">
  import { getAssetPath, getCardImagePath } from '@lib/_utils/asset-paths';
  import { CardColor, CardType, UnitType } from '../../_model/enums-battle';
  import type { CardTemplate, Land, SpellCard } from '../../_model/model-battle';
  import { DataEffectTemplates } from '../../battle/effects/effect-templates';
  import { KEYWORD_TOOLTIPS } from '../_helpers/keywordTooltips';
  import { TRIGGER_ICONS } from '../_helpers/triggerIcons';
  import Tooltip from '../Tooltip.svelte';

  let { card }: { card: CardTemplate | Land } = $props();

  // Tooltip state
  let hoveredKeyword = $state<string | null>(null);

  function handleMouseEnter(keyword: string) {
    hoveredKeyword = keyword;
  }

  function handleMouseLeave() {
    hoveredKeyword = null;
  }

  // Create the background image path using the card id
  let cardImagePath = $derived(getCardImagePath(card.id));

  // Check if card is a unit card (works with CardTemplate type)
  function isUnitCard(card: CardTemplate | Land): card is CardTemplate & {
    power: number;
    maxHealth: number;
    keywords?: any;
    abilities?: any;
    unitTypes?: UnitType[];
  } {
    return card.type === CardType.Unit;
  }

  // Check if card is a spell card
  function isSpellCard(card: CardTemplate | Land): card is SpellCard {
    return card.type === CardType.Spell;
  }

  // Check if card is a land card
  function isLandCard(card: CardTemplate | Land): card is (CardTemplate | Land) & {
    health: number;
    abilities?: any;
    retaliate?: number;
  } {
    return card.type === CardType.Land;
  }

  // Helper function to get color image path
  function getColorImagePath(color: CardColor): string {
    return getAssetPath(`images/color_${color}.png`);
  }

  // Get concatenated text from all actions for spells
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

  // Get full ability text
  function getAbilityText(ability: any) {
    let label = ability.trigger.type + ': ';
    ability.actions.forEach((action: any) => {
      label +=
        DataEffectTemplates[action.effect.name](action.effect.args).label(action.targets || []) +
        '\n';
    });
    return label;
  }

  // Full keyword names
  const keywordNames = {
    ranged: 'Ranged',
    haste: 'Haste',
    moveAndAttack: 'Move and Attack',
    retaliate: 'Retaliate',
    armor: 'Armor',
    resist: 'Resist',
    poisonous: 'Poisonous',
    regeneration: 'Regeneration',
    trample: 'Trample',
    zerk: 'Zerk',
    cleave: 'Cleave',
    lance: 'Lance',
    flying: 'Flying',
    immobile: 'Immobile',
  };

  // Get all active keywords with their values
  let activeKeywords = $derived(() => {
    if (!isUnitCard(card) || !card.keywords) return [];

    const result: Array<{ key: string; value?: number; icon: string; name: string }> = [];

    Object.entries(card.keywords).forEach(([key, value]) => {
      if (value && key in keywordNames) {
        const icon = `/assets/images/keywords/${key}.png`;
        if (typeof value === 'number') {
          result.push({
            key,
            value,
            icon,
            name: keywordNames[key as keyof typeof keywordNames],
          });
        } else if (value === true) {
          result.push({
            key,
            icon,
            name: keywordNames[key as keyof typeof keywordNames],
          });
        }
      }
    });

    return result;
  });
</script>

<div class="card-full">
  <!-- Card name bar with integrated cost -->
  <div
    class="name {isUnitCard(card) && card.unitTypes && card.unitTypes.length > 0
      ? 'has-unit-types'
      : ''}"
  >
    {#if !isLandCard(card)}
      <div class="cost" style="background-image: url('{getAssetPath('images/mana-border.png')}');">
        {card.cost}
      </div>
    {/if}
    <div class="name-content">
      <span class="name-text">{card.name}</span>
      <!-- Unit types display - only for Unit cards with unitTypes -->
      {#if isUnitCard(card) && card.unitTypes && card.unitTypes.length > 0}
        <div class="unit-types">
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

    <!-- Bottom section with stats -->
    <div class="bottom-section">
      <!-- Stats display - Unit cards -->
      {#if isUnitCard(card)}
        <div class="stats-container">
          <div class="stat">
            <span class="stat-label">Power:</span>
            <span class="stat-value">{card.power}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Health:</span>
            <span class="stat-value">{card.maxHealth}</span>
          </div>
        </div>
      {:else if isLandCard(card)}
        <div class="stats-container">
          <div class="stat">
            <span class="stat-label">Retaliate:</span>
            <span class="stat-value">{card.retaliate || 0}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Health:</span>
            <span class="stat-value">{card.health}</span>
          </div>
        </div>
      {/if}
    </div>
  </div>
  <!-- Abilities and Keywords section below the image -->
  <div class="details-section">
    <!-- Abilities display - only for Unit and Land cards with abilities -->
    {#if (isUnitCard(card) || isLandCard(card)) && card.abilities && card.abilities.length > 0}
      {#each card.abilities as ability}
        <div class="ability-item">
          <div class="ability-header">
            <span class="ability-icon"
              >{TRIGGER_ICONS[ability.trigger.type as keyof typeof TRIGGER_ICONS]}</span
            >
            <span class="ability-trigger">{ability.trigger.type}</span>
            {#if ability.cost !== undefined && ability.cost > 0}
              <span class="ability-cost">({ability.cost})</span>
            {/if}
            {#if ability.exhausts}
              <span class="ability-exhausts">↻</span>
            {/if}
          </div>
          <div class="ability-text">{getAbilityText(ability)}</div>
        </div>
      {/each}
    {/if}

    <!-- Keywords display - only for Unit cards with keywords -->
    {#if isUnitCard(card) && card.keywords && activeKeywords().length > 0}
      {#each activeKeywords() as { key, value, icon, name }}
        <Tooltip
          content={typeof KEYWORD_TOOLTIPS[key as keyof typeof KEYWORD_TOOLTIPS] === 'function'
            ? (KEYWORD_TOOLTIPS[key as keyof typeof KEYWORD_TOOLTIPS] as Function)(value)
            : KEYWORD_TOOLTIPS[key as keyof typeof KEYWORD_TOOLTIPS]}
          show={hoveredKeyword === key}
        >
          <div
            class="keyword-item"
            onmouseenter={() => handleMouseEnter(key)}
            onmouseleave={handleMouseLeave}
          >
            <img src={icon} alt={name} class="keyword-icon" />
            <span class="keyword-name">{name} {value}</span>
          </div>
        </Tooltip>
      {/each}
    {/if}

    <!-- Spell effect display for SpellCard -->
    {#if isSpellCard(card)}
      <div class="spell-effect-item">
        <div class="spell-text">{getSpellText()}</div>
      </div>
    {/if}
  </div>
</div>

<style>
  .card-full {
    width: 512px;
    border-radius: 16px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    border: 3px solid #bfa14a;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
    background: #000;
    overflow: hidden;
  }

  .content {
    width: 512px;
    height: 512px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px;
    position: relative;
    flex-shrink: 0;
  }

  .content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    pointer-events: none;
  }

  .name {
    background: #000;
    color: white;
    padding: 16px 20px;
    font-weight: bold;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    border-radius: 13px 13px 0 0;
  }

  .name-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .unit-types {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .unit-type-text {
    color: #999;
    font-size: 0.9rem;
    font-weight: normal;
    text-transform: capitalize;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 12px;
  }

  .cost {
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-shadow: 0 2px 4px #000;
    flex-shrink: 0;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    padding-bottom: 3px;
  }

  .colors {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    z-index: 2;
  }

  .color-stack {
    position: relative;
    height: 42px;
    margin-bottom: 4px;
  }

  .color-indicator {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid var(--color-golden);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
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

  .details-section {
    background: #000;
    padding: 16px;
    border-radius: 0 0 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 200px;
    overflow-y: auto;
    flex-shrink: 0;
  }

  .ability-item {
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
  }

  .ability-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .ability-icon {
    font-size: 1.2rem;
  }

  .ability-trigger {
    font-weight: bold;
    color: var(--color-golden);
  }

  .ability-cost {
    background: radial-gradient(ellipse at 60% 40%, #444 60%, #222 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 0.8rem;
    border: 1px solid #bfa14a;
  }

  .ability-exhausts {
    color: var(--color-golden);
    font-weight: bold;
  }

  .ability-text {
    font-size: 0.9rem;
    line-height: 1.3;
    white-space: pre-line;
    color: white;
  }

  .keyword-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
  }

  .keyword-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  .keyword-name {
    font-weight: bold;
    color: white;
  }

  .spell-effect-item {
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
  }

  .bottom-section {
    position: relative;
    z-index: 2;
  }

  .stats-container {
    display: flex;
    gap: 16px;
    justify-content: center;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--color-golden);
  }

  .stat-label {
    font-weight: bold;
    color: var(--color-golden);
  }

  .stat-value {
    font-size: 1.2rem;
    font-weight: bold;
  }

  .spell-text {
    font-size: 0.9rem;
    line-height: 1.3;
    white-space: pre-line;
    color: white;
  }
</style>
