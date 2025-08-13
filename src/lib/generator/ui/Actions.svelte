<script lang="ts">
  import { CardType } from '../../_model/enums';
  import type { ActionDefinition } from '../../_model/model-battle';

  export let state: {
    type: CardType;
    actions: ActionDefinition[];
  };

  export let editingActionIndex: number;
  export let newAction: {
    effectName: string;
    effectArgs: string;
    hasTargets: boolean;
    targetType: string;
    targetCount: number;
  };

  export let addAction: () => void;
  export let removeAction: (index: number) => void;
  export let editAction: (index: number) => void;
  export let updateAction: () => void;
  export let cancelEdit: () => void;
</script>

<div class="form-section" class:hidden={state.type !== CardType.Spell}>
  <h3>Actions</h3>

  {#each state.actions as action, index}
    <div class="action-item">
      <div class="action-header">
        <span class="action-name">{action.effect.name}</span>
        <div class="action-buttons">
          <button type="button" onclick={() => editAction(index)} class="edit-btn">Edit</button>
          <button type="button" onclick={() => removeAction(index)} class="remove-btn"
            >Remove</button
          >
        </div>
      </div>
      <div class="action-details">
        <div><strong>Args:</strong> {JSON.stringify(action.effect.args || {})}</div>
        <div>
          <strong>Targets:</strong>
          {action.targets?.map((t) => t.type + (t.count ? ' (' + t.count + ')' : '')).join(', ') ||
            'None'}
        </div>
      </div>
    </div>
  {/each}

  <div class="action-form">
    <h4>{editingActionIndex >= 0 ? 'Edit Action' : 'Add New Action'}</h4>

    <div class="form-group">
      <label for="effectName">Effect Name:</label>
      <input
        id="effectName"
        type="text"
        bind:value={newAction.effectName}
        placeholder="e.g., damageUnit"
      />
    </div>

    <div class="form-group">
      <label for="effectArgs">Effect Args (JSON):</label>
      <textarea
        id="effectArgs"
        bind:value={newAction.effectArgs}
        placeholder={'{} (empty object by default)'}
        rows="3"
      ></textarea>
    </div>

    <div class="form-group">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={newAction.hasTargets} />
        Requires targets
      </label>
    </div>

    {#if newAction.hasTargets}
      <div class="action-targets">
        <div class="form-group">
          <label for="targetType">Target Type:</label>
          <select id="targetType" bind:value={newAction.targetType}>
            <option value="unit">Unit</option>
            <option value="position">Position</option>
            <option value="land">Land</option>
            <option value="player">Player</option>
            <option value="card">Card</option>
          </select>
        </div>

        <div class="form-group">
          <label for="targetCount">Count:</label>
          <input
            id="targetCount"
            type="number"
            bind:value={newAction.targetCount}
            min="1"
            max="10"
          />
        </div>
      </div>
    {/if}

    <div class="action-buttons">
      {#if editingActionIndex >= 0}
        <button type="button" onclick={updateAction} class="update-btn">Update Action</button>
        <button type="button" onclick={cancelEdit} class="cancel-btn">Cancel</button>
      {:else}
        <button type="button" onclick={addAction} class="add-btn">Add Action</button>
      {/if}
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

  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
    white-space: nowrap;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }

  .form-group textarea {
    resize: vertical;
    min-height: 60px;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
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

  /* Action styles */
  .action-item {
    background-color: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
  }

  .action-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .action-name {
    font-weight: bold;
    color: #333;
    font-size: 16px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .edit-btn {
    background-color: #ffc107;
    color: #212529;
    padding: 6px 12px;
    font-size: 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .edit-btn:hover {
    background-color: #e0a800;
  }

  .remove-btn {
    background-color: #dc3545;
    padding: 6px 12px;
    font-size: 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: white;
  }

  .remove-btn:hover {
    background-color: #c82333;
  }

  .action-details {
    font-size: 14px;
    color: #666;
  }

  .action-details > div {
    margin-bottom: 5px;
  }

  .action-form {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 20px;
    margin-top: 20px;
  }

  .action-form h4 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 10px;
  }

  .action-targets {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
  }

  .action-targets .form-group {
    flex: 1;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
  }

  .add-btn {
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 14px;
  }

  .add-btn:hover {
    background-color: #218838;
  }

  .update-btn {
    background-color: #17a2b8;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 14px;
  }

  .update-btn:hover {
    background-color: #138496;
  }

  .cancel-btn {
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 14px;
  }

  .cancel-btn:hover {
    background-color: #5a6268;
  }
</style>
