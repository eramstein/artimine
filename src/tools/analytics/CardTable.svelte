<script lang="ts">
  import type { Color, Card } from './types';
  import CardFull from '../../lib/ui/CardFull.svelte';

  let { filteredCards = [] }: { filteredCards?: Card[] } = $props();

  type SortDirection = 'asc' | 'desc' | null;
  type SortField =
    | 'name'
    | 'type'
    | 'cost'
    | 'power'
    | 'health'
    | 'colors'
    | 'rarity'
    | 'unitTypes'
    | 'keywords';

  let sortField = $state<SortField | null>(null);
  let sortDirection = $state<SortDirection>(null);
  let selectedCard = $state<Card | null>(null);
  let showCardModal = $state(false);
  let searchQuery = $state('');

  let sortedCards = $derived.by(() => {
    if (!filteredCards) {
      return [];
    }

    let cards = [...filteredCards];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      cards = cards.filter((card) => {
        // Search in all card properties
        const cardString = JSON.stringify(card).toLowerCase();
        return cardString.includes(query);
      });
    }

    // Apply sorting
    if (!sortField || !sortDirection) {
      return cards;
    }

    return cards.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = getCardType(a).toLowerCase();
          bValue = getCardType(b).toLowerCase();
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'power':
          aValue = a.power || 0;
          bValue = b.power || 0;
          break;
        case 'health':
          aValue = a.maxHealth || 0;
          bValue = b.maxHealth || 0;
          break;
        case 'colors':
          aValue = formatColors(a.colors).toLowerCase();
          bValue = formatColors(b.colors).toLowerCase();
          break;
        case 'rarity':
          aValue = a.rarity.toLowerCase();
          bValue = b.rarity.toLowerCase();
          break;
        case 'unitTypes':
          aValue = formatUnitTypes(a.unitTypes).toLowerCase();
          bValue = formatUnitTypes(b.unitTypes).toLowerCase();
          break;
        case 'keywords':
          aValue = formatKeywords(a.keywords).toLowerCase();
          bValue = formatKeywords(b.keywords).toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  });

  function handleSort(field: SortField) {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        sortDirection = 'desc';
      } else if (sortDirection === 'desc') {
        sortField = null;
        sortDirection = null;
      }
    } else {
      sortField = field;
      sortDirection = 'asc';
    }
  }

  function getSortIcon(field: SortField): string {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  }

  function handleRowClick(card: Card) {
    selectedCard = card;
    showCardModal = true;
  }

  function closeModal() {
    showCardModal = false;
    selectedCard = null;
  }

  function formatColors(colors: Color[]): string {
    return colors.map((c) => `${c.color}(${c.count})`).join(', ');
  }

  function getColorVar(color: string): string {
    const colorMap: Record<string, string> = {
      white: 'var(--color-white)',
      blue: 'var(--color-blue)',
      black: 'var(--color-black)',
      red: 'var(--color-red)',
      green: 'var(--color-green)',
    };
    return colorMap[color] || '#ccc';
  }

  function formatUnitTypes(unitTypes?: string[]): string {
    return unitTypes ? unitTypes.join(', ') : '';
  }

  function formatKeywords(keywords?: Record<string, any>): string {
    if (!keywords) return '';
    return Object.entries(keywords)
      .map(([key, value]) => `${key}${value !== true ? ` ${value}` : ''}`)
      .join(' - ');
  }

  function getCardType(card: Card): string {
    if (card.type === 'unit') {
      return 'Unit';
    }
    if (card.type === 'spell') {
      return 'Spell';
    }
    return card.type;
  }
</script>

<div class="card-table-container">
  <div class="search-container">
    <input
      type="text"
      placeholder="Search cards..."
      bind:value={searchQuery}
      class="search-input"
    />
    {#if searchQuery}
      <button class="clear-search" onclick={() => (searchQuery = '')}>×</button>
    {/if}
  </div>
  <div class="table-wrapper">
    <table class="card-table">
      <thead>
        <tr>
          <th class="sortable" onclick={() => handleSort('name')}>
            {getSortIcon('name')} Name
          </th>
          <th class="sortable" onclick={() => handleSort('type')}>
            {getSortIcon('type')} Type
          </th>
          <th class="sortable" onclick={() => handleSort('cost')}>
            {getSortIcon('cost')} Cost
          </th>
          <th class="sortable" onclick={() => handleSort('power')}>
            {getSortIcon('power')} Power
          </th>
          <th class="sortable" onclick={() => handleSort('health')}>
            {getSortIcon('health')} Health
          </th>
          <th class="sortable" onclick={() => handleSort('colors')}>
            {getSortIcon('colors')} Colors
          </th>
          <th class="sortable" onclick={() => handleSort('rarity')}>
            {getSortIcon('rarity')} Rarity
          </th>
          <th class="sortable" onclick={() => handleSort('unitTypes')}>
            {getSortIcon('unitTypes')} Unit Types
          </th>
          <th class="sortable" onclick={() => handleSort('keywords')}>
            {getSortIcon('keywords')} Keywords
          </th>
        </tr>
      </thead>
      <tbody>
        {#each sortedCards as card}
          <tr class="card-row" onclick={() => handleRowClick(card)}>
            <td class="card-name">{card.name}</td>
            <td class="card-type">{getCardType(card)}</td>
            <td class="card-cost">{card.cost}</td>
            <td class="card-power">{card.power || '-'}</td>
            <td class="card-health">{card.maxHealth || '-'}</td>
            <td class="card-colors">
              <div class="color-circles">
                {#each card.colors as color}
                  <div
                    class="color-circle"
                    style="background-color: {getColorVar(color.color)}"
                    title="{color.color} ({color.count})"
                  >
                    {color.count}
                  </div>
                {/each}
              </div>
            </td>
            <td class="card-rarity">{card.rarity}</td>
            <td class="card-unit-types">{formatUnitTypes(card.unitTypes)}</td>
            <td class="card-keywords">{formatKeywords(card.keywords)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if showCardModal && selectedCard}
    <div class="modal-overlay" onclick={closeModal}>
      <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <button class="close-button" onclick={closeModal}>×</button>
        <CardFull card={selectedCard as any} />
      </div>
    </div>
  {/if}
</div>

<style>
  .card-table-container {
    padding: 20px;
    max-width: 100%;
    overflow-x: auto;
  }

  .search-container {
    position: relative;
    margin-bottom: 16px;
    max-width: 400px;
  }

  .search-input {
    width: 100%;
    padding: 10px 40px 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .clear-search {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #999;
    padding: 4px;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clear-search:hover {
    background: #f0f0f0;
    color: #666;
  }

  .table-wrapper {
    overflow-x: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .card-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    font-size: 14px;
  }

  .card-table th {
    background: #f5f5f5;
    padding: 12px 8px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #ddd;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
  }

  .sortable:hover {
    background: #e9ecef !important;
  }

  .card-table td {
    padding: 8px;
    border-bottom: 1px solid #eee;
    vertical-align: top;
  }

  .card-row:hover {
    background-color: #f8f9fa;
  }

  .card-name {
    font-weight: 500;
    color: #2c3e50;
  }

  .card-cost {
    font-weight: 600;
  }

  .card-power,
  .card-health {
    font-weight: 600;
    text-align: center;
  }

  .card-colors {
    font-size: 12px;
    color: #34495e;
  }

  .color-circles {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .color-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    color: white;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .color-circle[style*='var(--color-white)'] {
    color: #333;
    text-shadow: none;
    border: 1px solid #ccc;
  }

  .card-rarity {
    text-transform: capitalize;
    font-weight: 500;
  }

  .card-unit-types {
    font-size: 12px;
  }

  .card-keywords {
    font-size: 12px;
    max-width: 200px;
    word-wrap: break-word;
  }

  .card-row {
    cursor: pointer;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    padding: 20px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    z-index: 1001;
  }

  .close-button:hover {
    color: #333;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .card-table {
      font-size: 12px;
    }

    .card-table th,
    .card-table td {
      padding: 6px 4px;
    }

    .card-keywords {
      max-width: 150px;
    }
  }
</style>
