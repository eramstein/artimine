<script lang="ts">
  import type { Color, Card, Filters } from './types';

  let {
    allCards,
    filters,
    onFiltersChange,
  }: {
    allCards: Card[];
    filters: Filters;
    onFiltersChange: (filters: Partial<Filters>) => void;
  } = $props();

  // Calculate color combination data
  let colorCombinations = $derived.by(() => {
    const combinations = new Map<string, number>();

    allCards.forEach((card) => {
      const colors = card.colors
        .map((c) => c.color)
        .sort()
        .join('-');
      combinations.set(colors, (combinations.get(colors) || 0) + 1);
    });

    return Array.from(combinations.entries())
      .map(([colors, count]) => ({ colors, count }))
      .sort((a, b) => b.count - a.count);
  });

  // Calculate cost distribution
  let costDistribution = $derived.by(() => {
    const costs = new Map<number, number>();

    allCards.forEach((card) => {
      costs.set(card.cost, (costs.get(card.cost) || 0) + 1);
    });

    return Array.from(costs.entries())
      .map(([cost, count]) => ({ cost, count }))
      .sort((a, b) => a.cost - b.cost);
  });

  // Calculate card type distribution
  let cardTypeDistribution = $derived.by(() => {
    const types = new Map<string, number>();

    allCards.forEach((card) => {
      types.set(card.type, (types.get(card.type) || 0) + 1);
    });

    return Array.from(types.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  });

  // Calculate rarity distribution
  let rarityDistribution = $derived.by(() => {
    const rarities = new Map<string, number>();

    allCards.forEach((card) => {
      rarities.set(card.rarity, (rarities.get(card.rarity) || 0) + 1);
    });

    return Array.from(rarities.entries())
      .map(([rarity, count]) => ({ rarity, count }))
      .sort((a, b) => b.count - a.count);
  });

  function handleCardTypeClick(type: string) {
    if (filters.cardType === type) {
      onFiltersChange({ cardType: undefined });
    } else {
      onFiltersChange({ cardType: type });
    }
  }

  function handleColorClick(colors: string) {
    if (filters.colorCombination === colors) {
      onFiltersChange({ colorCombination: undefined });
    } else {
      onFiltersChange({ colorCombination: colors });
    }
  }

  function handleCostClick(cost: number) {
    if (filters.cost === cost) {
      onFiltersChange({ cost: undefined });
    } else {
      onFiltersChange({ cost });
    }
  }

  function handleRarityClick(rarity: string) {
    if (filters.rarity === rarity) {
      onFiltersChange({ rarity: undefined });
    } else {
      onFiltersChange({ rarity });
    }
  }

  function getMaxCount(items: Array<{ count: number }>) {
    return Math.max(...items.map((item) => item.count));
  }

  function formatColorLabel(colors: string) {
    if (colors === '') return 'Colorless';
    return colors
      .split('-')
      .map((color) => color.charAt(0).toUpperCase() + color.slice(1))
      .join('-');
  }
</script>

<div class="filters-container">
  <!-- Card Type Distribution -->
  <section class="filter-section">
    <h4>Card Types</h4>
    <div class="chart-container">
      {#each cardTypeDistribution as item}
        <div
          class="bar-item"
          class:active={filters.cardType === item.type}
          onclick={() => handleCardTypeClick(item.type)}
        >
          <div class="bar-label">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
          <div class="bar-container">
            <div
              class="bar"
              style="width: {(item.count / getMaxCount(cardTypeDistribution)) * 100}%"
            ></div>
          </div>
          <span class="bar-count">{item.count}</span>
        </div>
      {/each}
    </div>
  </section>

  <!-- Color Combinations -->
  <section class="filter-section">
    <h4>Color Combinations</h4>
    <div class="chart-container">
      {#each colorCombinations as item}
        <div
          class="bar-item"
          class:active={filters.colorCombination === item.colors}
          onclick={() => handleColorClick(item.colors)}
        >
          <div class="bar-label">{formatColorLabel(item.colors)}</div>
          <div class="bar-container">
            <div
              class="bar"
              style="width: {(item.count / getMaxCount(colorCombinations)) * 100}%"
            ></div>
          </div>
          <span class="bar-count">{item.count}</span>
        </div>
      {/each}
    </div>
  </section>

  <!-- Cost Distribution -->
  <section class="filter-section">
    <h4>Cost Distribution</h4>
    <div class="chart-container">
      {#each costDistribution as item}
        <div
          class="bar-item"
          class:active={filters.cost === item.cost}
          onclick={() => handleCostClick(item.cost)}
        >
          <div class="bar-label">Cost {item.cost}</div>
          <div class="bar-container">
            <div
              class="bar"
              style="width: {(item.count / getMaxCount(costDistribution)) * 100}%"
            ></div>
          </div>
          <span class="bar-count">{item.count}</span>
        </div>
      {/each}
    </div>
  </section>

  <!-- Rarity Distribution -->
  <section class="filter-section">
    <h4>Rarity Distribution</h4>
    <div class="chart-container">
      {#each rarityDistribution as item}
        <div
          class="bar-item"
          class:active={filters.rarity === item.rarity}
          onclick={() => handleRarityClick(item.rarity)}
        >
          <div class="bar-label">{item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}</div>
          <div class="bar-container">
            <div
              class="bar"
              style="width: {(item.count / getMaxCount(rarityDistribution)) * 100}%"
            ></div>
          </div>
          <span class="bar-count">{item.count}</span>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .filters-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .filter-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
  }

  .filter-section h4 {
    margin: 0 0 12px 0;
    color: #495057;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .chart-container {
    display: flex;
    flex-direction: column;
  }

  .bar-item {
    cursor: pointer;
    padding: 4px 0;
    border-radius: 4px;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bar-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .bar-item.active {
    background: #e3f2fd;
  }

  .bar-label {
    font-size: 12px;
    color: #6c757d;
    font-weight: 500;
    min-width: 60px;
    flex-shrink: 0;
  }

  .bar-container {
    position: relative;
    height: 20px;
    background: #e9ecef;
    border-radius: 10px;
    overflow: hidden;
    flex: 1;
  }

  .bar {
    height: 100%;
    background: linear-gradient(90deg, #007bff, #0056b3);
    border-radius: 10px;
    transition: width 0.3s ease;
  }

  .bar-item.active .bar {
    background: linear-gradient(90deg, #28a745, #1e7e34);
  }

  .bar-count {
    font-size: 12px;
    font-weight: 600;
    color: #495057;
    min-width: 20px;
    text-align: right;
    flex-shrink: 0;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .filter-section {
      padding: 12px;
    }

    .bar-label {
      font-size: 11px;
    }

    .bar-count {
      font-size: 9px;
    }
  }
</style>
