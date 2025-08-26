<script lang="ts">
  import { CardType } from '../../../lib/_model';

  export let state: {
    type: CardType;
  };

  export let state_keywords: {
    ranged: boolean;
    haste: boolean;
    moveAndAttack: boolean;
    retaliate: number;
    armor: number;
    resist: number;
    poisonous: number;
    regeneration: number;
    trample: boolean;
    zerk: boolean;
    cleave: boolean;
    lance: boolean;
    flying: boolean;
  };

  export let keywordCosts: any;
</script>

<div class="form-section" class:hidden={state.type !== CardType.Unit}>
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
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={state_keywords.cleave} />
        Cleave <span class="keyword-cost">({keywordCosts.cleave} pts)</span>
      </label>
    </div>

    <div class="keyword-group">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={state_keywords.lance} />
        Lance <span class="keyword-cost">({keywordCosts.lance} pts)</span>
      </label>
    </div>

    <div class="keyword-group">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={state_keywords.flying} />
        Flying <span class="keyword-cost">({keywordCosts.flying} pts)</span>
      </label>
    </div>

    <div class="keyword-group">
      <label>Retaliate: <span class="keyword-cost">({keywordCosts.retaliate} pts each)</span></label
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
      <label>Poisonous: <span class="keyword-cost">({keywordCosts.poisonous} pts each)</span></label
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

  .keyword-cost {
    color: #666;
    font-size: 12px;
    font-weight: normal;
  }
</style>
