<script lang="ts">
  import { CardType, TriggerType, UnitType } from '../../../lib/_model';
  import type { Ability, ActionDefinition } from '../../../lib/_model';
  import type { UnitFilterArgs } from '../../../lib/battle/effects';
  import { getRangeLabel } from '../../../lib/battle/effects';
  import Actions from './Actions.svelte';

  const props = $props<{
    state: {
      type: CardType;
      abilities: Ability[];
    };
    // ability editing state (owned by parent)
    editingAbilityIndex: number;
    newAbility: {
      triggerType: TriggerType;
      range: UnitFilterArgs;
      cost: number;
      exhausts: boolean;
      staticRecompute: TriggerType[];
      text: string;
      actions: ActionDefinition[];
    };
    addAbility: () => void;
    removeAbility: (index: number) => void;
    editAbility: (index: number) => void;
    updateAbility: () => void;
    cancelEditAbility: () => void;
  }>();

  // Local state for ability actions editing (reusing Actions.svelte UI)
  let editingActionIndex = $state(-1);
  let newAction = $state({
    effectName: '',
    effectArgs: {} as Record<string, any>,
    hasTargets: false,
    targets: [] as { type: any; count?: number }[],
  });

  function getCleanArgs(args: Record<string, any>): Record<string, any> {
    const cleanArgs: Record<string, any> = {};
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && Object.keys(value).length > 0) {
          cleanArgs[key] = value;
        } else if (typeof value !== 'object') {
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

  // Actions management for the ability under edit
  function addActionToAbility() {
    const action: ActionDefinition = {
      effect: { name: newAction.effectName, args: getCleanArgs(newAction.effectArgs) },
      ...(newAction.hasTargets && { targets: newAction.targets }),
    };
    props.newAbility.actions = [...props.newAbility.actions, action];
    // reset
    newAction.effectName = '';
    newAction.effectArgs = {};
    newAction.hasTargets = false;
    newAction.targets = [];
  }

  function removeActionFromAbility(index: number) {
    props.newAbility.actions = props.newAbility.actions.filter(
      (_: ActionDefinition, i: number) => i !== index
    );
  }

  function editActionInAbility(index: number) {
    const action = props.newAbility.actions[index];
    newAction.effectName = action.effect.name;
    newAction.effectArgs = { ...action.effect.args };
    newAction.hasTargets = !!(action.targets && action.targets.length > 0);
    newAction.targets = action.targets ? [...action.targets] : [];
    editingActionIndex = index;
  }

  function updateActionInAbility() {
    const action: ActionDefinition = {
      effect: { name: newAction.effectName, args: getCleanArgs(newAction.effectArgs) },
      ...(newAction.hasTargets && { targets: newAction.targets }),
    };
    props.newAbility.actions = props.newAbility.actions.map((a: ActionDefinition, i: number) =>
      i === editingActionIndex ? action : a
    );
    // reset
    newAction.effectName = '';
    newAction.effectArgs = {};
    newAction.hasTargets = false;
    newAction.targets = [];
    editingActionIndex = -1;
  }

  function cancelEditActionInAbility() {
    newAction.effectName = '';
    newAction.effectArgs = {};
    newAction.hasTargets = false;
    newAction.targets = [];
    editingActionIndex = -1;
  }

  // Helpers for range UI
  function toggleRangeFlag(flag: keyof UnitFilterArgs, checked: boolean) {
    if (checked) {
      (props.newAbility.range as any)[flag] = true;
    } else {
      delete (props.newAbility.range as any)[flag];
    }
  }

  function setRangeUnitType(value: string) {
    if (value && value !== '') {
      (props.newAbility.range as any).unitType = value as unknown as UnitType;
    } else {
      delete (props.newAbility.range as any).unitType;
    }
  }
</script>

<div class="form-section" class:hidden={props.state.type !== CardType.Unit}>
  <h3>Abilities</h3>

  {#if props.state.abilities && props.state.abilities.length > 0}
    {#each props.state.abilities as ability, index}
      <div class="ability-item">
        <div class="ability-header">
          <span class="ability-name">{ability.trigger.type}</span>
          <div class="ability-buttons">
            <button type="button" onclick={() => props.editAbility(index)} class="edit-btn"
              >Edit</button
            >
            <button type="button" onclick={() => props.removeAbility(index)} class="remove-btn"
              >Remove</button
            >
          </div>
        </div>
        <div class="ability-details">
          <div>
            <strong>Range:</strong>
            {ability.trigger.range ? getRangeLabel(ability.trigger.range) : 'None'}
          </div>
          <div><strong>Cost:</strong> {ability.cost ?? 0}</div>
          <div><strong>Exhausts:</strong> {ability.exhausts ? 'Yes' : 'No'}</div>
          <div><strong>Actions:</strong> {ability.actions?.length || 0}</div>
          {#if ability.trigger.text}
            <div><strong>Text:</strong> {ability.trigger.text}</div>
          {/if}
        </div>
      </div>
    {/each}
  {/if}

  <div class="ability-form">
    <div class="ability-form-header">
      <div class="ability-buttons">
        {#if props.editingAbilityIndex >= 0}
          <button type="button" onclick={props.updateAbility} class="update-btn"
            >Update Ability</button
          >
          <button type="button" onclick={props.cancelEditAbility} class="cancel-btn">Cancel</button>
        {:else}
          <button type="button" onclick={props.addAbility} class="add-btn">Add Ability</button>
        {/if}
      </div>
    </div>

    <div class="form-group">
      <label for="triggerType">Trigger Type:</label>
      <select id="triggerType" bind:value={props.newAbility.triggerType}>
        {#each Object.values(TriggerType) as trig}
          <option value={trig}>{trig}</option>
        {/each}
      </select>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="abilityCost">Cost:</label>
        <input id="abilityCost" type="number" bind:value={props.newAbility.cost} min="0" />
      </div>
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={props.newAbility.exhausts} />
          Exhausts
        </label>
      </div>
    </div>

    <div class="form-group">
      <label for="abilityText">Text (optional):</label>
      <input
        id="abilityText"
        type="text"
        bind:value={props.newAbility.text}
        placeholder="Rules text hint"
      />
    </div>

    {#if props.newAbility.triggerType === TriggerType.Static}
      <div class="form-group">
        <label>Recompute on:</label>
        <div class="checkbox-grid">
          {#each Object.values(TriggerType) as trig}
            {#if trig !== TriggerType.Static}
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  checked={props.newAbility.staticRecompute.includes(trig)}
                  onchange={(e: Event) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    if (checked) {
                      props.newAbility.staticRecompute = [
                        ...props.newAbility.staticRecompute,
                        trig,
                      ];
                    } else {
                      props.newAbility.staticRecompute = props.newAbility.staticRecompute.filter(
                        (t: TriggerType) => t !== trig
                      );
                    }
                  }}
                />
                {trig}
              </label>
            {/if}
          {/each}
        </div>
      </div>
    {/if}

    <div class="range-section">
      <h5>Trigger Range</h5>
      <div class="checkbox-grid">
        <label class="checkbox-label">
          <input
            type="checkbox"
            checked={!!props.newAbility.range.self}
            onchange={(e) => toggleRangeFlag('self', (e.target as HTMLInputElement).checked)}
          />
          Self
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            checked={!!props.newAbility.range.all}
            onchange={(e) => toggleRangeFlag('all', (e.target as HTMLInputElement).checked)}
          />
          All units
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            checked={!!props.newAbility.range.sameRow}
            onchange={(e) => toggleRangeFlag('sameRow', (e.target as HTMLInputElement).checked)}
          />
          Same Row
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            checked={!!props.newAbility.range.sameColumn}
            onchange={(e) => toggleRangeFlag('sameColumn', (e.target as HTMLInputElement).checked)}
          />
          Same Column
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            checked={!!props.newAbility.range.allies}
            onchange={(e) => toggleRangeFlag('allies', (e.target as HTMLInputElement).checked)}
          />
          Allies
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            checked={!!props.newAbility.range.ennemies}
            onchange={(e) => toggleRangeFlag('ennemies', (e.target as HTMLInputElement).checked)}
          />
          Enemies
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            checked={!!props.newAbility.range.adjacent}
            onchange={(e) => toggleRangeFlag('adjacent', (e.target as HTMLInputElement).checked)}
          />
          Adjacent
        </label>
      </div>
      <div class="form-group">
        <label for="rangeUnitType">Unit Type (optional):</label>
        <select
          id="rangeUnitType"
          value={(props.newAbility.range as any).unitType || ''}
          onchange={(e) => setRangeUnitType((e.target as HTMLSelectElement).value)}
        >
          <option value="">None</option>
          {#each Object.values(UnitType) as unitType}
            <option value={unitType}>{unitType}</option>
          {/each}
        </select>
      </div>
    </div>

    <Actions
      state={{ type: CardType.Spell, actions: props.newAbility.actions }}
      {editingActionIndex}
      {newAction}
      addAction={addActionToAbility}
      removeAction={removeActionFromAbility}
      editAction={editActionInAbility}
      updateAction={updateActionInAbility}
      cancelEdit={cancelEditActionInAbility}
    />
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
    margin-bottom: 10px;
  }

  .ability-item {
    background-color: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
  }

  .ability-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .ability-name {
    font-weight: bold;
    color: #333;
    font-size: 16px;
  }

  .ability-buttons {
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

  .ability-details {
    font-size: 14px;
    color: #666;
  }
  .ability-details > div {
    margin-bottom: 4px;
  }

  .ability-form {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 20px;
    margin-top: 20px;
  }

  .ability-form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
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
  .checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
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

  .form-row {
    display: flex;
    gap: 15px;
    align-items: end;
  }
</style>
