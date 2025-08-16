<script lang="ts">
  import { CardType } from '../../../lib/_model';

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
  export let actionsBudget: number;
  export let remainingBudget: number;
  export let resetForm: () => void;
</script>

<div class="form-section budget-section">
  <div class="budget-header">
    <h3>Budget</h3>
    <div class="budget-display">
      <span class="remaining-value {remainingBudget < 0 ? 'negative' : ''}">{remainingBudget}</span>
      <span class="separator">:</span>
      <span class="total-value">{totalBudget}</span>
      {#if state.type === CardType.Unit}
        {#if statsBudget > 0}
          <span class="cost-separator">-</span>
          <span class="cost-value">{statsBudget} stats</span>
        {/if}
        {#if keywordsBudget > 0}
          <span class="cost-separator">-</span>
          <span class="cost-value">{keywordsBudget} keywords</span>
        {/if}
      {:else if actionsBudget > 0}
        <span class="cost-separator">-</span>
        <span class="cost-value">{actionsBudget} actions</span>
      {/if}
    </div>
    <button type="button" onclick={resetForm} class="reset-btn">Reset Form</button>
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

  .budget-section {
    background-color: #e8f4fd;
    border-color: #007bff;
  }

  .budget-header {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .budget-header h3 {
    margin: 0;
    color: #333;
    white-space: nowrap;
    min-width: 60px;
  }

  .form-section h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
  }

  .reset-btn {
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .reset-btn:hover {
    background-color: #5a6268;
  }

  .budget-display {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    font-family: 'Courier New', monospace;
    font-size: 16px;
  }

  .remaining-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    min-width: 30px;
    text-align: right;
  }

  .remaining-value.negative {
    color: #dc3545;
  }

  .separator {
    font-size: 18px;
    color: #666;
    margin: 0 2px;
  }

  .total-value {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-right: 8px;
  }

  .cost-separator {
    font-size: 14px;
    color: #999;
    margin: 0 4px;
  }

  .cost-value {
    font-size: 14px;
    color: #999;
    font-weight: normal;
  }
</style>
