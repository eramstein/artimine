<script lang="ts">
  import { CardType, UnitType, TargetType } from '../../../lib/_model';
  import type { ActionDefinition, TargetDefinition } from '../../../lib/_model';
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
      targets: TargetDefinition[];
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
          argName.toLowerCase().includes('damage') ||
          argName.toLowerCase().includes('value') ||
          argName.toLowerCase().includes('duration')
        ) {
          args[argName] = 0;
        } else if (argName.includes('is') || argName.includes('has')) {
          args[argName] = false;
        } else {
          args[argName] = '';
        }
      });
      props.newAction.effectArgs = args;

      // Set default targets if they exist
      if (currentBaseEffect.defaultTargets) {
        props.newAction.hasTargets = true;
        props.newAction.targets = [...currentBaseEffect.defaultTargets];
      } else {
        props.newAction.hasTargets = false;
        props.newAction.targets = [];
      }
    } else {
      props.newAction.effectArgs = {};
      props.newAction.hasTargets = false;
      props.newAction.targets = [];
    }
  });

  // Initialize targets when hasTargets is checked
  $effect(() => {
    if (!props.newAction.hasTargets) {
      props.newAction.targets = [];
    }
  });

  // Auto-add target when user selects values
  let autoTargetType = $state(TargetType.Units);
  let autoTargetCount = $state(1);

  $effect(() => {
    if (props.newAction.hasTargets && props.newAction.targets.length === 0) {
      // Auto-add target when user has selected values
      if (autoTargetType && autoTargetCount > 0) {
        props.newAction.targets = [{ type: autoTargetType, count: autoTargetCount }];
      }
    }
  });

  // Target management functions
  function addTarget() {
    props.newAction.targets = [...props.newAction.targets, { type: TargetType.Units, count: 1 }];
  }

  function removeTarget(index: number) {
    props.newAction.targets = props.newAction.targets.filter(
      (_: TargetDefinition, i: number) => i !== index
    );
  }

  function updateTarget(index: number, field: 'type' | 'count', value: TargetType | number) {
    props.newAction.targets = props.newAction.targets.map((target: TargetDefinition, i: number) =>
      i === index ? { ...target, [field]: value } : target
    );
  }

  // Filter out empty arguments for display
  function getCleanArgs(args: Record<string, any>): Record<string, any> {
    const cleanArgs: Record<string, any> = {};

    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && Object.keys(value).length > 0) {
          // For objects (like range), only include if they have properties
          cleanArgs[key] = value;
        } else if (typeof value !== 'object') {
          // For non-objects, include if they have a meaningful value
          // Ensure numeric values are properly typed as numbers
          if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
            cleanArgs[key] = Number(value);
          } else {
            cleanArgs[key] = value;
          }
        }
      }
    }

    return cleanArgs;
  }
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
        <div><strong>Args:</strong> {JSON.stringify(getCleanArgs(action.effect.args || {}))}</div>
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
    <div class="action-form-header">
      <div class="action-buttons">
        {#if props.editingActionIndex >= 0}
          <button type="button" onclick={props.updateAction} class="update-btn"
            >Update Action</button
          >
          <button type="button" onclick={props.cancelEdit} class="cancel-btn">Cancel</button>
        {:else}
          <button type="button" onclick={props.addAction} class="add-btn">Add Action</button>
        {/if}
      </div>
    </div>

    <div class="form-group">
      <label for="effectName">Effect Name:</label>
      <select id="effectName" bind:value={props.newAction.effectName}>
        <option value="">Select an effect...</option>
        {#each effectNames as effectName}
          <option value={effectName}>{effectName}</option>
        {/each}
      </select>
    </div>

    <div class="action-form-content">
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

      <div class="targets-section">
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={props.newAction.hasTargets} />
            Requires targets
          </label>
        </div>

        {#if props.newAction.hasTargets}
          <div class="action-targets">
            <h5>Targets:</h5>
            {#each props.newAction.targets as target, targetIndex}
              <div class="target-item">
                <div class="target-controls">
                  <div class="form-group">
                    <label for="targetType{targetIndex}">Target Type:</label>
                    <select
                      id="targetType{targetIndex}"
                      value={target.type}
                      onchange={(e) => {
                        const select = e.target as HTMLSelectElement;
                        updateTarget(targetIndex, 'type', select.value as TargetType);
                      }}
                    >
                      {#each Object.values(TargetType) as targetType}
                        <option value={targetType}>{targetType}</option>
                      {/each}
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="targetCount{targetIndex}">Count:</label>
                    <input
                      id="targetCount{targetIndex}"
                      type="number"
                      value={target.count}
                      onchange={(e) => {
                        const input = e.target as HTMLInputElement;
                        updateTarget(targetIndex, 'count', parseInt(input.value) || 1);
                      }}
                      min="1"
                      max="10"
                    />
                  </div>

                  {#if props.newAction.targets.length > 1}
                    <button
                      type="button"
                      onclick={() => removeTarget(targetIndex)}
                      class="remove-target-btn"
                    >
                      Remove
                    </button>
                  {/if}
                </div>
              </div>
            {/each}

            {#if props.newAction.targets.length === 0}
              <div class="auto-target-controls">
                <div class="form-group">
                  <label for="autoTargetType">Target Type:</label>
                  <select id="autoTargetType" bind:value={autoTargetType}>
                    {#each Object.values(TargetType) as targetType}
                      <option value={targetType}>{targetType}</option>
                    {/each}
                  </select>
                </div>

                <div class="form-group">
                  <label for="autoTargetCount">Count:</label>
                  <input
                    id="autoTargetCount"
                    type="number"
                    bind:value={autoTargetCount}
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            {:else}
              <button type="button" onclick={addTarget} class="add-target-btn"
                >Add Another Target</button
              >
            {/if}
          </div>
        {/if}
      </div>
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

  .action-form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .action-form-content {
    display: flex;
    gap: 20px;
  }

  .effect-args,
  .targets-section {
    flex: 1;
  }

  .action-targets {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 15px;
  }

  .action-targets h5 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 5px;
  }

  .target-item {
    background-color: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 15px;
  }

  .target-controls {
    display: flex;
    gap: 15px;
    align-items: end;
  }

  .target-controls .form-group {
    flex: 1;
    margin-bottom: 0;
  }

  .auto-target-controls {
    display: flex;
    gap: 15px;
    align-items: end;
    background-color: #f8f9fa;
    border: 1px dashed #dee2e6;
    border-radius: 4px;
    padding: 15px;
  }

  .auto-target-controls .form-group {
    flex: 1;
    margin-bottom: 0;
  }

  .remove-target-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
  }

  .remove-target-btn:hover {
    background-color: #c82333;
  }

  .add-target-btn {
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 14px;
    align-self: flex-start;
  }

  .add-target-btn:hover {
    background-color: #218838;
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
