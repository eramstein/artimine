<script lang="ts">
  import { UnitType } from '../../../lib/_model';
  import type { UnitKeywords } from '../../../lib/_model';

  const props = $props<{
    range: Record<string, any>;
    onRangeChange: (range: Record<string, any>) => void;
  }>();

  // Helper function to toggle range flags
  function toggleRangeFlag(flag: string, checked: boolean) {
    const newRange = { ...props.range };
    if (checked) {
      newRange[flag] = true;
    } else {
      delete newRange[flag];
    }
    props.onRangeChange(newRange);
  }

  // Helper function to set unit type
  function setUnitType(value: string) {
    const newRange = { ...props.range };
    if (value && value !== '') {
      newRange.unitType = value as UnitType;
    } else {
      delete newRange.unitType;
    }
    props.onRangeChange(newRange);
  }

  // Helper function to set has keyword
  function setHasKeyword(value: string) {
    const newRange = { ...props.range };
    if (value && value !== '') {
      newRange.hasKeyword = value as keyof UnitKeywords;
    } else {
      delete newRange.hasKeyword;
    }
    props.onRangeChange(newRange);
  }
</script>

<div class="range-options">
  <div class="range-section">
    <h6>Range Options:</h6>
    <div class="checkbox-grid">
      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={!!props.range.self}
          onchange={(e) => toggleRangeFlag('self', (e.target as HTMLInputElement).checked)}
        />
        Self
      </label>
      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={!!props.range.addSelf}
          onchange={(e) => toggleRangeFlag('addSelf', (e.target as HTMLInputElement).checked)}
        />
        Add Self
      </label>
      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={!!props.range.all}
          onchange={(e) => toggleRangeFlag('all', (e.target as HTMLInputElement).checked)}
        />
        All units
      </label>
      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={!!props.range.sameRow}
          onchange={(e) => toggleRangeFlag('sameRow', (e.target as HTMLInputElement).checked)}
        />
        Same Row
      </label>
      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={!!props.range.inFrontOf}
          onchange={(e) => toggleRangeFlag('inFrontOf', (e.target as HTMLInputElement).checked)}
        />
        In Front Of
      </label>
      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={!!props.range.sameColumn}
          onchange={(e) => toggleRangeFlag('sameColumn', (e.target as HTMLInputElement).checked)}
        />
        Same Column
      </label>
      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={!!props.range.allies}
          onchange={(e) => toggleRangeFlag('allies', (e.target as HTMLInputElement).checked)}
        />
        Allies
      </label>
      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={!!props.range.ennemies}
          onchange={(e) => toggleRangeFlag('ennemies', (e.target as HTMLInputElement).checked)}
        />
        Enemies
      </label>
      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={!!props.range.adjacent}
          onchange={(e) => toggleRangeFlag('adjacent', (e.target as HTMLInputElement).checked)}
        />
        Adjacent
      </label>
    </div>
  </div>
  <div class="range-section">
    <label for="unitType">Unit Type (optional):</label>
    <select
      id="unitType"
      value={props.range.unitType || ''}
      onchange={(e) => setUnitType((e.target as HTMLSelectElement).value)}
    >
      <option value="">None</option>
      {#each Object.values(UnitType) as unitType}
        <option value={unitType}>{unitType}</option>
      {/each}
    </select>
  </div>
  <div class="range-section">
    <label for="hasKeyword">Has Keyword (optional):</label>
    <select
      id="hasKeyword"
      value={props.range.hasKeyword || ''}
      onchange={(e) => setHasKeyword((e.target as HTMLSelectElement).value)}
    >
      <option value="">None</option>
      <option value="ranged">Ranged</option>
      <option value="haste">Haste</option>
      <option value="moveAndAttack">Move and Attack</option>
      <option value="retaliate">Retaliate</option>
      <option value="armor">Armor</option>
      <option value="resist">Resist</option>
      <option value="poisonous">Poisonous</option>
      <option value="regeneration">Regeneration</option>
      <option value="trample">Trample</option>
      <option value="zerk">Zerk</option>
      <option value="cleave">Cleave</option>
      <option value="lance">Lance</option>
    </select>
  </div>
</div>

<style>
  .range-options {
    background-color: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 15px;
  }

  .range-section {
    margin-bottom: 15px;
  }

  .range-section:last-child {
    margin-bottom: 0;
  }

  .range-section h6 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
    font-size: 14px;
  }

  .checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
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

  .range-section label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
    white-space: nowrap;
  }

  .range-section select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }
</style>
