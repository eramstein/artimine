<script lang="ts">
  import type { CardColor } from '@/lib/_model';
  import { getAssetPath } from '@/lib/_utils/asset-paths';

  let {
    allCardTemplates,
    filters,
    onFiltersChange,
  }: {
    allCardTemplates: () => Map<string, any>;
    filters: {
      cardType: string | undefined;
      colorCombination: string | undefined;
    };
    onFiltersChange: (filters: {
      cardType: string | undefined;
      colorCombination: string | undefined;
    }) => void;
  } = $props();

  let availableCardTypes = $derived(() => {
    const types = new Set<string>();
    const templates = allCardTemplates();
    templates.forEach((template: any) => {
      if (template.type) {
        types.add(template.type);
      }
    });
    return Array.from(types).sort();
  });

  let availableColorCombinations = $derived(() => {
    const combinations = new Set<string>();
    const templates = allCardTemplates();
    templates.forEach((template: any) => {
      if (template.colors && template.colors.length > 0) {
        const colors = template.colors
          .map((c: any) => c.color)
          .sort()
          .join('-');
        combinations.add(colors);
      } else {
        combinations.add(''); // Colorless
      }
    });
    return Array.from(combinations).sort((a, b) => {
      // Sort by number of colors (fewer colors first)
      const aColorCount = a === '' ? 0 : a.split('-').length;
      const bColorCount = b === '' ? 0 : b.split('-').length;

      if (aColorCount !== bColorCount) {
        return aColorCount - bColorCount;
      }

      // If same number of colors, sort alphabetically
      return a.localeCompare(b);
    });
  });

  function handleCardTypeFilter(type: string) {
    if (filters.cardType === type) {
      onFiltersChange({ ...filters, cardType: undefined });
    } else {
      onFiltersChange({ ...filters, cardType: type });
    }
  }

  function handleColorFilter(colors: string) {
    if (filters.colorCombination === colors) {
      onFiltersChange({ ...filters, colorCombination: undefined });
    } else {
      onFiltersChange({ ...filters, colorCombination: colors });
    }
  }

  // Helper function to get color image path
  function getColorImagePath(color: CardColor): string {
    return getAssetPath(`images/color_${color}.png`);
  }
</script>

<div class="filters-section">
  <!-- Card Type Filter -->
  <div class="filter-group">
    <div class="filter-options">
      {#each availableCardTypes() as type}
        <button
          class="filter-option"
          class:active={filters.cardType === type}
          onclick={() => handleCardTypeFilter(type)}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      {/each}
    </div>
  </div>

  <!-- Color Filter -->
  <div class="filter-group">
    <div class="filter-options">
      {#each availableColorCombinations() as colors}
        {#if colors.split('-').length === 1}
          <div
            class="color-symbol filter-option"
            class:active={filters.colorCombination === colors}
            onclick={() => handleColorFilter(colors)}
            style="background-image: url('{getColorImagePath(colors.split('-')[0] as CardColor)}');"
          ></div>
        {:else}
          <div
            class="color-symbols filter-option"
            class:active={filters.colorCombination === colors}
            onclick={() => handleColorFilter(colors)}
          >
            {#each colors.split('-') as color}
              <div
                class="color-symbol"
                style="background-image: url('{getColorImagePath(color as CardColor)}');"
              ></div>
            {/each}
          </div>
        {/if}
      {/each}
    </div>
  </div>
</div>

<style>
  .filters-section {
    padding: 15px;
    display: flex;
    gap: 25px;
  }

  .filter-group {
    margin-bottom: 15px;
    padding-right: 25px;
    border-right: 1px solid #606060;
  }

  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .filter-option {
    background-color: #3a3a3a;
    color: #e0e0e0;
    border: 1px solid #606060;
    padding: 8px 12px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .filter-option:hover {
    background-color: #4a4a4a;
    border-color: #808080;
  }

  .filter-option.active {
    background-color: #007bff;
    color: #fff;
    border-color: #007bff;
  }

  .color-symbols {
    display: flex;
    gap: 0px;
    align-items: center;
    padding: 0px;
  }

  .color-symbols .color-symbol:not(:first-child) {
    margin-left: -8px;
  }

  .color-symbol {
    width: 16px;
    height: 16px;
    padding: 8px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  /* Override button styling for color symbols that act as filter options */
  .color-symbol.filter-option {
    background-color: transparent;
    border: none;
    padding: 8px 12px;
    border-radius: 20px;
    color: transparent;
    min-width: auto;
    min-height: auto;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .color-symbol.filter-option:hover {
    background-color: transparent;
    border-color: rgba(255, 255, 255, 0.6);
  }

  .color-symbol.filter-option.active {
    background-color: transparent;
    border-color: transparent;
    color: transparent;
    filter: brightness(2) saturate(1.5);
  }

  .color-symbols.filter-option {
    background-color: transparent;
    border: none;
    border-radius: 20px;
    color: transparent;
    min-width: auto;
    min-height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .color-symbols.filter-option:hover {
    background-color: transparent;
    border-color: transparent;
  }

  .color-symbols.filter-option.active {
    background-color: transparent;
    border-color: transparent;
    color: transparent;
  }

  .color-symbols.filter-option.active .color-symbol {
    filter: brightness(2) saturate(1.5);
  }
</style>
