<script lang="ts">
  /*
    Giant vibecoded form to help create cards, not meant to be used by other people.
  */
  import { CardType, CardRarity, CardColor, UnitType } from '../../../lib/_model';
  import type {
    UnitCardTemplate,
    SpellCardTemplate,
    UnitKeywords,
    ActionDefinition,
    TargetDefinition,
  } from '../../../lib/_model';
  import { baseStatsCost, getBudgetForUnit, getBudgetForSpell, getActionsBudget } from '../budgets';
  import { costPerKeywordForUnit } from '../keywords';

  // Import components
  import BasicInfo from './BasicInfo.svelte';
  import BudgetSection from './BudgetSection.svelte';
  import UnitTypes from './UnitTypes.svelte';
  import Keywords from './Keywords.svelte';
  import Actions from './Actions.svelte';
  import JsonOutput from './JsonOutput.svelte';

  // Filter out empty arguments for clean JSON output
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

  // Form state
  let state = $state({
    name: '',
    rarity: CardRarity.Common,
    type: CardType.Spell,
    cost: 1,
    power: 1,
    maxHealth: 1,
    colors: [{ color: CardColor.Red, count: 1 }],
    unitTypes: [] as UnitType[],
    keywords: undefined as UnitKeywords | undefined,
    actions: [] as ActionDefinition[],
  });

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

  // Action editing state
  let editingActionIndex = $state(-1);
  let newAction = $state({
    effectName: '',
    effectArgs: {} as Record<string, any>,
    hasTargets: false,
    targets: [] as TargetDefinition[],
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

  // Action management
  function addAction() {
    try {
      const action: ActionDefinition = {
        effect: {
          name: newAction.effectName,
          args: getCleanArgs(newAction.effectArgs),
        },
        ...(newAction.hasTargets && {
          targets: newAction.targets,
        }),
      };

      state.actions = [...state.actions, action];

      // Reset form
      newAction.effectName = '';
      newAction.effectArgs = {};
      newAction.hasTargets = false;
      newAction.targets = [];
    } catch (error) {
      alert('Error adding action: ' + error);
    }
  }

  function removeAction(index: number) {
    state.actions = state.actions.filter((_: any, i: number) => i !== index);
  }

  function editAction(index: number) {
    const action = state.actions[index];
    newAction.effectName = action.effect.name;
    newAction.effectArgs = { ...action.effect.args };
    newAction.hasTargets = !!(action.targets && action.targets.length > 0);
    newAction.targets = action.targets || [];
    editingActionIndex = index;
  }

  function updateAction() {
    try {
      const action: ActionDefinition = {
        effect: {
          name: newAction.effectName,
          args: getCleanArgs(newAction.effectArgs),
        },
        ...(newAction.hasTargets && {
          targets: newAction.targets,
        }),
      };

      state.actions = state.actions.map((a: any, i: number) =>
        i === editingActionIndex ? action : a
      );

      // Reset form
      newAction.effectName = '';
      newAction.effectArgs = {};
      newAction.hasTargets = false;
      newAction.targets = [];
      editingActionIndex = -1;
    } catch (error) {
      alert('Error updating action: ' + error);
    }
  }

  function cancelEdit() {
    newAction.effectName = '';
    newAction.effectArgs = {};
    newAction.hasTargets = false;
    newAction.targets = [];
    editingActionIndex = -1;
  }

  // Generate JSON
  function generateJSON() {
    if (state.type === CardType.Unit) {
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
    } else {
      const cardData: SpellCardTemplate = {
        id: derivedId,
        name: state.name,
        rarity: state.rarity,
        type: state.type,
        cost: state.cost,
        colors: state.colors,
        actions: state.actions,
      };
      return JSON.stringify(cardData, null, 2);
    }
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

  // Budget calculations (for both units and spells)
  let totalBudget = $derived(
    state.type === CardType.Unit
      ? getBudgetForUnit(state.cost, state.colors)
      : getBudgetForSpell(state.cost, state.colors)
  );

  let statsBudget = $derived(
    state.type === CardType.Unit
      ? state.power * baseStatsCost.power + state.maxHealth * baseStatsCost.health
      : 0
  );

  // Get keyword costs for display
  let keywordCosts = $derived(
    state.type === CardType.Unit
      ? costPerKeywordForUnit({
          power: state.power,
          maxHealth: state.maxHealth,
          colors: state.colors,
        })
      : {}
  );

  let keywordsBudget = $derived(
    (() => {
      if (
        state.type !== CardType.Unit ||
        !state.keywords ||
        Object.keys(state.keywords).length === 0
      )
        return 0;

      let total = 0;
      Object.entries(state.keywords).forEach(([key, value]) => {
        const keywordKey = key as keyof UnitKeywords;
        if (typeof value === 'number' && value > 0) {
          total += (keywordCosts as any)[keywordKey] * value;
        } else if (value === true) {
          total += (keywordCosts as any)[keywordKey];
        }
      });
      return total;
    })()
  );

  let actionsBudget = $derived(state.type === CardType.Spell ? getActionsBudget(state.actions) : 0);

  let remainingBudget = $derived(
    state.type === CardType.Unit
      ? totalBudget - statsBudget - keywordsBudget
      : totalBudget - actionsBudget
  );

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
    state.actions = [];

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

    // Reset action editing
    cancelEdit();
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
  <BudgetSection
    {state}
    {totalBudget}
    {statsBudget}
    {keywordsBudget}
    {actionsBudget}
    {remainingBudget}
    {resetForm}
  />

  <div class="form-sections">
    <BasicInfo {state} {addColor} {removeColor} {updateColor} />

    <UnitTypes {state} {toggleUnitType} />

    <Keywords {state} {state_keywords} {keywordCosts} />

    <Actions
      {state}
      {editingActionIndex}
      {newAction}
      {addAction}
      {removeAction}
      {editAction}
      {updateAction}
      {cancelEdit}
    />

    <JsonOutput {jsonOutput} {downloadJSON} />
  </div>
</div>

<style>
  .card-builder {
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-sections {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
</style>
