<script lang="ts">
  import { CardType, UnitType, TargetType } from '../../_model/enums';
  import type { ActionDefinition } from '../../_model/model-battle';
  import { baseEffects, getBaseEffect } from '../base-effects';

  const props = $props<{
    state: {
      type: CardType;
      actions: ActionDefinition[];
    };
    editingActionIndex: number;
    newAction: {
      effectName: string;
      effectArgs: Record<string, any>;
      hasTargets: boolean;
      targetType: string;
      targetCount: number;
    };
    addAction: () => void;
    removeAction: (index: number) => void;
    editAction: (index: number) => void;
    updateAction: () => void;
    cancelEdit: () => void;
  }>();

  // Get available effect names
  const effectNames = baseEffects.map((effect) => effect.effectName);

  // Get current base effect
  const currentBaseEffect = $derived(
    props.newAction.effectName ? getBaseEffect(props.newAction.effectName) : null
  );

  // Initialize effect args when effect name changes
  $effect(() => {
    if (props.newAction.effectName && currentBaseEffect) {
      const args: Record<string, any> = {};
      currentBaseEffect.argNames.forEach((argName) => {
        if (argName === 'range') {
          // Initialize range as an empty object - properties will be added as needed
          args[argName] = {};
        } else if (
          argName.includes('damage') ||
          argName.includes('Value') ||
          argName.includes('duration')
        ) {
          args[argName] = 0;
        } else if (argName.includes('is') || argName.includes('has')) {
          args[argName] = false;
        } else {
          args[argName] = '';
        }
      });
      props.newAction.effectArgs = args;
    } else {
      props.newAction.effectArgs = {};
    }
  });
</script>

<div class="form-section" class:hidden={props.state.type !== CardType.Spell}>
  <h3>Actions</h3>

  {#each props.state.actions as action, index}
    <div class="action-item">
      <div class="action-header">
        <span class="action-name">{action.effect.name}</span>
        <div class="action-buttons">
          <button type="button" onclick={() => props.editAction(index)} class="edit-btn"
            >Edit</button
          >
          <button type="button" onclick={() => props.removeAction(index)} class="remove-btn"
            >Remove</button
          >
        </div>
      </div>
      <div class="action-details">
        <div><strong>Args:</strong> {JSON.stringify(action.effect.args || {})}</div>
        <div>
          <strong>Targets:</strong>
          {action.targets
            ?.map((t: any) => t.type + (t.count ? ' (' + t.count + ')' : ''))
            .join(', ') || 'None'}
        </div>
      </div>
    </div>
  {/each}

  <div class="action-form">
    <h4>{props.editingActionIndex >= 0 ? 'Edit Action' : 'Add New Action'}</h4>

    <div class="form-group">
      <label for="effectName">Effect Name:</label>
      <select id="effectName" bind:value={props.newAction.effectName}>
        <option value="">Select an effect...</option>
        {#each effectNames as effectName}
          <option value={effectName}>{effectName}</option>
        {/each}
      </select>
    </div>

    {#if currentBaseEffect && currentBaseEffect.argNames.length > 0}
      <div class="effect-args">
        <h5>Effect Arguments:</h5>
        {#each currentBaseEffect.argNames as argName}
          <div class="form-group">
            <label for={argName}>
              {argName}
              <span class="required">*</span>
            </label>

            {#if argName === 'range'}
              <!-- Special handling for range argument -->
              {#if props.newAction.effectArgs[argName]}
                <div class="range-options">
                  <div class="range-section">
                    <h6>Range Options:</h6>
                    <div class="checkbox-grid">
                      <label class="checkbox-label">
                        <input
                          type="checkbox"
                          checked={!!props.newAction.effectArgs[argName].self}
                          onchange={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (target.checked) {
                              props.newAction.effectArgs[argName].self = true;
                            } else {
                              delete props.newAction.effectArgs[argName].self;
                            }
                          }}
                        />
                        Self
                      </label>
                      <label class="checkbox-label">
                        <input
                          type="checkbox"
                          checked={!!props.newAction.effectArgs[argName].sameRow}
                          onchange={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (target.checked) {
                              props.newAction.effectArgs[argName].sameRow = true;
                            } else {
                              delete props.newAction.effectArgs[argName].sameRow;
                            }
                          }}
                        />
                        Same Row
                      </label>
                      <label class="checkbox-label">
                        <input
                          type="checkbox"
                          checked={!!props.newAction.effectArgs[argName].sameColumn}
                          onchange={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (target.checked) {
                              props.newAction.effectArgs[argName].sameColumn = true;
                            } else {
                              delete props.newAction.effectArgs[argName].sameColumn;
                            }
                          }}
                        />
                        Same Column
                      </label>
                      <label class="checkbox-label">
                        <input
                          type="checkbox"
                          checked={!!props.newAction.effectArgs[argName].allies}
                          onchange={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (target.checked) {
                              props.newAction.effectArgs[argName].allies = true;
                            } else {
                              delete props.newAction.effectArgs[argName].allies;
                            }
                          }}
                        />
                        Allies
                      </label>
                      <label class="checkbox-label">
                        <input
                          type="checkbox"
                          checked={!!props.newAction.effectArgs[argName].ennemies}
                          onchange={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (target.checked) {
                              props.newAction.effectArgs[argName].ennemies = true;
                            } else {
                              delete props.newAction.effectArgs[argName].ennemies;
                            }
                          }}
                        />
                        Enemies
                      </label>
                      <label class="checkbox-label">
                        <input
                          type="checkbox"
                          checked={!!props.newAction.effectArgs[argName].adjacent}
                          onchange={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (target.checked) {
                              props.newAction.effectArgs[argName].adjacent = true;
                            } else {
                              delete props.newAction.effectArgs[argName].adjacent;
                            }
                          }}
                        />
                        Adjacent
                      </label>
                    </div>
                  </div>
                  <div class="range-section">
                    <label for="unitType">Unit Type (optional):</label>
                    <select
                      id="unitType"
                      value={props.newAction.effectArgs[argName].unitType || ''}
                      onchange={(e) => {
                        const target = e.target as HTMLSelectElement;
                        const value = target.value;
                        if (value && value !== '') {
                          props.newAction.effectArgs[argName].unitType = value;
                        } else {
                          delete props.newAction.effectArgs[argName].unitType;
                        }
                      }}
                    >
                      <option value="">None</option>
                      {#each Object.values(UnitType) as unitType}
                        <option value={unitType}>{unitType}</option>
                      {/each}
                    </select>
                  </div>
                </div>
              {:else}
                <div class="range-placeholder">
                  <em>Select an effect to configure range options</em>
                </div>
              {/if}
            {:else if argName.includes('damage') || argName.includes('Value') || argName.includes('duration')}
              <input
                id={argName}
                type="number"
                bind:value={props.newAction.effectArgs[argName]}
                placeholder={`Enter ${argName}`}
              />
            {:else if argName.includes('is') || argName.includes('has')}
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={props.newAction.effectArgs[argName]} />
                {argName}
              </label>
            {:else}
              <input
                id={argName}
                type="text"
                bind:value={props.newAction.effectArgs[argName]}
                placeholder={`Enter ${argName}`}
              />
            {/if}

            <div class="arg-description">
              {argName === 'range' ? 'Unit filter options' : `Parameter: ${argName}`}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="form-group">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={props.newAction.hasTargets} />
        Requires targets
      </label>
    </div>

    {#if props.newAction.hasTargets}
      <div class="action-targets">
        <div class="form-group">
          <label for="targetType">Target Type:</label>
          <select id="targetType" bind:value={props.newAction.targetType}>
            <option value="">Select target type...</option>
            {#each Object.values(TargetType) as targetType}
              <option value={targetType}>{targetType}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="targetCount">Count:</label>
          <input
            id="targetCount"
            type="number"
            bind:value={props.newAction.targetCount}
            min="1"
            max="10"
          />
        </div>
      </div>
    {/if}

    <div class="action-buttons">
      {#if props.editingActionIndex >= 0}
        <button type="button" onclick={props.updateAction} class="update-btn">Update Action</button>
        <button type="button" onclick={props.cancelEdit} class="cancel-btn">Cancel</button>
      {:else}
        <button type="button" onclick={props.addAction} class="add-btn">Add Action</button>
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

  .required {
    color: #dc3545;
    margin-left: 4px;
  }

  .effect-args {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
  }

  .effect-args h5 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 5px;
  }

  .arg-description {
    margin-top: 5px;
    font-size: 12px;
    color: #666;
    font-style: italic;
  }

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

  .range-placeholder {
    padding: 10px;
    background-color: #f8f9fa;
    border: 1px dashed #dee2e6;
    border-radius: 4px;
    text-align: center;
    color: #6c757d;
    font-style: italic;
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
