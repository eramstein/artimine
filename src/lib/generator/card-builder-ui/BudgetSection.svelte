<script lang="ts">
  import { CardType } from '../../_model/enums';

  export let state: {
    type: CardType;
    cost: number;
    power: number;
    maxHealth: number;
    colors: { color: any; count: number }[];
    keywords: any;
  };

  export let totalBudget: number;
  export let statsBudget: number;
  export let keywordsBudget: number;
  export let remainingBudget: number;
  export let resetForm: () => void;
</script>

<div class="form-section budget-section" class:hidden={state.type !== CardType.Unit}>
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

  .budget-section {
    background-color: #e8f4fd;
    border-color: #007bff;
  }

  .form-section h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
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
</style>
