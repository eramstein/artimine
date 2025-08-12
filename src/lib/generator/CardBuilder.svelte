<script lang="ts">
  /*
    Giant vibecoded form to help create cards, not meant to be used by other people.
  */
  import { CardType, CardRarity, CardColor, UnitType } from '../_model/enums';
  import type { UnitCardTemplate, UnitKeywords } from '../_model/model-battle';
  import { getBudgetForUnit, baseStatsCost } from './budgets';
  import { costPerKeywordForUnit } from './keywords';

  // Form state
  let state = $state({
    name: '',
    rarity: CardRarity.Common,
    type: CardType.Unit,
    cost: 1,
    power: 1,
    maxHealth: 1,
    colors: [{ color: CardColor.Red, count: 1 }],
    unitTypes: [] as UnitType[],
    keywords: {} as UnitKeywords,
  });

  // Available options
  const rarityOptions = Object.values(CardRarity);
  const colorOptions = Object.values(CardColor);
  const unitTypeOptions = Object.values(UnitType);

  // Keywords state
  let state_keywords = $state({
    ranged: false,
    haste: false,
    moveAndAttack: false,
    retaliate: 0,
    armor: 0,
    resist: 0,
    poisonous: 0,
    regeneration: 0,
    trample: false,
    zerk: false,
  });

  // Color management
  function addColor() {
    state.colors = [...state.colors, { color: CardColor.Red, count: 1 }];
  }

  function removeColor(index: number) {
    state.colors = state.colors.filter((_: any, i: number) => i !== index);
  }

  function updateColor(index: number, field: 'color' | 'count', value: CardColor | number) {
    state.colors = state.colors.map((color: any, i: number) =>
      i === index ? { ...color, [field]: value } : color
    );
  }

  // Unit type management
  function toggleUnitType(unitType: UnitType) {
    if (state.unitTypes.includes(unitType)) {
      state.unitTypes = state.unitTypes.filter((t: UnitType) => t !== unitType);
    } else {
      state.unitTypes = [...state.unitTypes, unitType];
    }
  }

  // Keywords management
  $effect(() => {
    const keywords: UnitKeywords = {};

    if (state_keywords.ranged) keywords.ranged = true;
    if (state_keywords.haste) keywords.haste = true;
    if (state_keywords.moveAndAttack) keywords.moveAndAttack = true;
    if (state_keywords.trample) keywords.trample = true;
    if (state_keywords.zerk) keywords.zerk = true;

    if (state_keywords.retaliate > 0) keywords.retaliate = state_keywords.retaliate;
    if (state_keywords.armor > 0) keywords.armor = state_keywords.armor;
    if (state_keywords.resist > 0) keywords.resist = state_keywords.resist;
    if (state_keywords.poisonous > 0) keywords.poisonous = state_keywords.poisonous;
    if (state_keywords.regeneration > 0) keywords.regeneration = state_keywords.regeneration;

    state.keywords = Object.keys(keywords).length > 0 ? keywords : undefined;
  });

  // Generate JSON
  function generateJSON() {
    const cardData: UnitCardTemplate = {
      id: derivedId,
      name: state.name,
      rarity: state.rarity,
      type: state.type,
      cost: state.cost,
      power: state.power,
      maxHealth: state.maxHealth,
      colors: state.colors,
      unitTypes: state.unitTypes.length > 0 ? state.unitTypes : undefined,
      keywords: state.keywords,
    };

    return JSON.stringify(cardData, null, 2);
  }

  // Derived card ID from name
  let derivedId = $derived(
    (() => {
      if (!state.name.trim()) return '';
      return state.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove punctuation and special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    })()
  );

  // Budget calculations
  let totalBudget = $derived(getBudgetForUnit(state.cost, state.colors));

  let statsBudget = $derived(
    state.power * baseStatsCost.power + state.maxHealth * baseStatsCost.health
  );

  // Get keyword costs for display
  let keywordCosts = $derived(
    costPerKeywordForUnit({
      power: state.power,
      maxHealth: state.maxHealth,
      colors: state.colors,
    })
  );

  let keywordsBudget = $derived(
    (() => {
      if (!state.keywords || Object.keys(state.keywords).length === 0) return 0;

      let total = 0;
      Object.entries(state.keywords).forEach(([key, value]) => {
        const keywordKey = key as keyof UnitKeywords;
        if (typeof value === 'number' && value > 0) {
          total += keywordCosts[keywordKey] * value;
        } else if (value === true) {
          total += keywordCosts[keywordKey];
        }
      });
      return total;
    })()
  );

  let remainingBudget = $derived(totalBudget - statsBudget - keywordsBudget);

  let jsonOutput = $derived(generateJSON());

  // Reset form function
  function resetForm() {
    state.name = '';
    state.rarity = CardRarity.Common;
    state.type = CardType.Unit;
    state.cost = 1;
    state.power = 1;
    state.maxHealth = 1;
    state.unitTypes = [];

    // Reset keywords state
    state_keywords.ranged = false;
    state_keywords.haste = false;
    state_keywords.moveAndAttack = false;
    state_keywords.trample = false;
    state_keywords.zerk = false;
    state_keywords.retaliate = 0;
    state_keywords.armor = 0;
    state_keywords.resist = 0;
    state_keywords.poisonous = 0;
    state_keywords.regeneration = 0;
  }

  // Download JSON function
  function downloadJSON() {
    if (!derivedId.trim()) {
      alert('Please enter a Card Name first!');
      return;
    }

    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${derivedId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="card-builder">
  <div class="form-section budget-section">
    <h3>Budget</h3>
    <div class="budget-breakdown">
      <div class="budget-item">
        <span class="budget-label">Total Budget:</span>
        <span class="budget-value">{totalBudget} points</span>
      </div>
      <div class="budget-item">
        <span class="budget-label">Stats Cost:</span>
        <span class="budget-value">-{statsBudget} points</span>
      </div>
      <div class="budget-item">
        <span class="budget-label">Keywords Cost:</span>
        <span class="budget-value">-{keywordsBudget} points</span>
      </div>
      <div class="budget-item total">
        <span class="budget-label">Remaining:</span>
        <span class="budget-value {remainingBudget < 0 ? 'negative' : ''}"
          >{remainingBudget} points</span
        >
      </div>
    </div>
    <button type="button" onclick={resetForm} class="reset-btn"> Reset Form (Keep Colors) </button>
  </div>

  <div class="form-section">
    <h3>Basic Information</h3>

    <div class="form-group">
      <label for="name">Card Name:</label>
      <input id="name" type="text" bind:value={state.name} placeholder="e.g., Savannah Lion" />
    </div>

    <div class="stats-row">
      <div class="form-group">
        <label for="power">Power:</label>
        <input id="power" type="number" bind:value={state.power} min="0" max="20" />
      </div>

      <div class="form-group">
        <label for="maxHealth">Max Health:</label>
        <input id="maxHealth" type="number" bind:value={state.maxHealth} min="1" max="20" />
      </div>
    </div>

    <div class="form-group">
      <label for="rarity">Rarity:</label>
      <select id="rarity" bind:value={state.rarity}>
        {#each rarityOptions as rarity}
          <option value={rarity}>{rarity}</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <label for="cost">Cost:</label>
      <input id="cost" type="number" bind:value={state.cost} min="0" max="10" />
    </div>

    <div class="form-group">
      <label>Colors:</label>
      {#each state.colors as color, index}
        <div class="color-group">
          <select
            bind:value={color.color}
            onchange={(e) => updateColor(index, 'color', (e.target as HTMLSelectElement).value)}
          >
            {#each colorOptions as colorOption}
              <option value={colorOption}>{colorOption}</option>
            {/each}
          </select>

          <input
            type="number"
            bind:value={color.count}
            min="1"
            max="5"
            onchange={(e) =>
              updateColor(index, 'count', parseInt((e.target as HTMLInputElement).value))}
          />

          <button type="button" onclick={() => removeColor(index)}>Remove</button>
        </div>
      {/each}

      <button type="button" onclick={addColor}>Add Color</button>
    </div>
  </div>

  <div class="form-section">
    <h3>Unit Types</h3>

    <div class="checkbox-group">
      {#each unitTypeOptions as unitType}
        <label class="checkbox-label">
          <input
            type="checkbox"
            checked={state.unitTypes.includes(unitType)}
            onchange={() => toggleUnitType(unitType)}
          />
          {unitType}
        </label>
      {/each}
    </div>
  </div>

  <div class="form-section">
    <h3>Keywords</h3>

    <div class="keywords-grid">
      <div class="keyword-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={state_keywords.ranged} />
          Ranged <span class="keyword-cost">({keywordCosts.ranged} pts)</span>
        </label>
      </div>

      <div class="keyword-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={state_keywords.haste} />
          Haste <span class="keyword-cost">({keywordCosts.haste} pts)</span>
        </label>
      </div>

      <div class="keyword-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={state_keywords.moveAndAttack} />
          Move and Attack <span class="keyword-cost">({keywordCosts.moveAndAttack} pts)</span>
        </label>
      </div>

      <div class="keyword-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={state_keywords.trample} />
          Trample <span class="keyword-cost">({keywordCosts.trample} pts)</span>
        </label>
      </div>

      <div class="keyword-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={state_keywords.zerk} />
          Zerk <span class="keyword-cost">({keywordCosts.zerk} pts)</span>
        </label>
      </div>

      <div class="keyword-group">
        <label
          >Retaliate: <span class="keyword-cost">({keywordCosts.retaliate} pts each)</span></label
        >
        <input type="number" bind:value={state_keywords.retaliate} min="0" max="10" />
      </div>

      <div class="keyword-group">
        <label>Armor: <span class="keyword-cost">({keywordCosts.armor} pts each)</span></label>
        <input type="number" bind:value={state_keywords.armor} min="0" max="10" />
      </div>

      <div class="keyword-group">
        <label>Resist: <span class="keyword-cost">({keywordCosts.resist} pts each)</span></label>
        <input type="number" bind:value={state_keywords.resist} min="0" max="10" />
      </div>

      <div class="keyword-group">
        <label
          >Poisonous: <span class="keyword-cost">({keywordCosts.poisonous} pts each)</span></label
        >
        <input type="number" bind:value={state_keywords.poisonous} min="0" max="10" />
      </div>

      <div class="keyword-group">
        <label
          >Regeneration: <span class="keyword-cost">({keywordCosts.regeneration} pts each)</span
          ></label
        >
        <input type="number" bind:value={state_keywords.regeneration} min="0" max="10" />
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Generated JSON</h3>
    <pre class="json-output">{jsonOutput}</pre>
    <button type="button" onclick={downloadJSON} class="download-btn"> Download </button>
  </div>
</div>

<style>
  .card-builder {
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .form-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    flex: 0 0 auto;
    box-sizing: border-box;
  }

  .form-section h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
  }

  .budget-section {
    background-color: #e8f4fd;
    border-color: #007bff;
  }

  .budget-breakdown {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .budget-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: white;
    border-radius: 4px;
    border: 1px solid #dee2e6;
  }

  .budget-item.total {
    font-weight: bold;
    background-color: #f8f9fa;
    border-color: #007bff;
  }

  .budget-label {
    color: #555;
  }

  .budget-value {
    font-weight: bold;
    color: #333;
  }

  .budget-value.negative {
    color: #dc3545;
  }

  .reset-btn {
    margin-top: 15px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    width: 100%;
  }

  .reset-btn:hover {
    background-color: #5a6268;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .stats-row {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
  }

  .stats-row .form-group {
    flex: 1;
    margin-bottom: 0;
  }

  .stats-row input {
    width: 100%;
    box-sizing: border-box;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .derived-id {
    margin-top: 5px;
    font-size: 12px;
    color: #666;
  }

  .derived-id code {
    background-color: #f8f9fa;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
  }

  .color-group {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }

  .color-group select {
    flex: 1;
  }

  .color-group input {
    width: 80px;
  }

  .color-group button {
    padding: 8px 12px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .color-group button:hover {
    background-color: #c82333;
  }

  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  button:hover {
    background-color: #0056b3;
  }

  .checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: normal;
  }

  .checkbox-label input[type='checkbox'] {
    width: auto;
    margin: 0;
  }

  .keywords-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .keyword-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .keyword-group label {
    font-weight: bold;
    color: #555;
  }

  .keyword-group input[type='number'] {
    width: 100%;
  }

  .keyword-cost {
    color: #666;
    font-size: 12px;
    font-weight: normal;
  }

  .json-output {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 15px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 15px;
  }

  .download-btn {
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 12px 24px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    width: 100%;
  }

  .download-btn:hover {
    background-color: #218838;
  }

  .download-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
</style>
