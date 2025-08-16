<script lang="ts">
  import { CardType, UnitType } from '../../../lib/_model';

  export let state: {
    type: CardType;
    unitTypes: UnitType[];
  };

  export let toggleUnitType: (unitType: UnitType) => void;

  // Available options
  const unitTypeOptions = Object.values(UnitType);
</script>

<div class="form-section" class:hidden={state.type !== CardType.Unit}>
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

<style>
  .form-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    flex: 0 0 auto;
    box-sizing: border-box;
  }

  .form-section.hidden {
    display: none !important;
  }

  .form-section h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
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
</style>
