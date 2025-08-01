<script lang="ts">
  import type { Ability, UnitDeployed } from '../_model/model-battle';
  import { TriggerType } from '../_model/enums';
  import Tooltip from './Tooltip.svelte';
  import { activateAbility } from './_helpers/abilities';
  import { uiState } from '../_state';

  let { abilities, unit }: { abilities: Ability[]; unit?: UnitDeployed } = $props();

  // Tooltip state
  let hoveredAbility = $state<string | null>(null);

  // Clear tooltip when ability becomes pending
  $effect(() => {
    if (uiState.battle.abilityPending) {
      hoveredAbility = null;
    }
  });

  // Get the first letter of each ability name for display
  let abilityLetters = $derived(() => {
    return abilities.map((ability) => ({
      letter: ability.icon || (ability.actions[0]?.text || '?').charAt(0).toUpperCase(),
      text: ability.actions[0]?.text || 'Unknown',
      isActivated: ability.trigger.type === TriggerType.Activated,
      ability: ability,
      isPending:
        uiState.battle.abilityPending?.unit.instanceId === unit?.instanceId &&
        uiState.battle.abilityPending?.ability === ability,
      cost: ability.cost,
      exhausts: ability.exhausts,
    }));
  });

  function handleMouseEnter(abilityName: string) {
    hoveredAbility = abilityName;
  }

  function handleMouseLeave() {
    hoveredAbility = null;
  }

  function onAbilityClick(ability: Ability, e: MouseEvent) {
    e.stopPropagation();
    // Clear tooltip when clicking
    hoveredAbility = null;
    if (unit) {
      activateAbility(unit, ability);
    }
  }

  function getTooltipContent(text: string, cost?: number, exhausts?: boolean): string {
    const costText = cost ? `(${cost}): ` : '';
    const exhaustText = exhausts ? '↻ ' : '';
    return `${exhaustText}${costText}${text}`;
  }
</script>

<div class="abilities">
  {#each abilityLetters() as { letter, text, isActivated, ability, isPending, cost, exhausts }}
    <Tooltip content={getTooltipContent(text, cost, exhausts)} show={hoveredAbility === text}>
      <div
        class="ability"
        class:activated={isActivated}
        class:pending={isPending}
        onmouseenter={() => handleMouseEnter(text)}
        onmouseleave={handleMouseLeave}
        onclick={(e) => isActivated && onAbilityClick(ability, e)}
      >
        <span class="ability-letter">{letter}</span>
        {#if cost !== undefined && cost > 0}
          <span class="ability-cost">{cost}</span>
        {/if}
      </div>
    </Tooltip>
  {/each}
</div>

<style>
  .abilities {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .ability {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2px 4px;
    width: 20px;
    border-radius: 4px;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-golden);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    position: relative;
    transition: all 0.2s ease;
  }

  .ability.activated {
    cursor: pointer;
  }

  .ability.activated:not(.pending):hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
  }

  .ability.pending {
    background: rgba(255, 215, 0, 0.8);
    color: black;
    border-color: #ffd700;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
    animation: pulse 0.5s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from {
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
    }
    to {
      box-shadow: 0 0 12px rgba(255, 215, 0, 0.8);
    }
  }

  .ability-letter {
    font-weight: bold;
    font-size: 0.9rem;
  }

  .ability-cost {
    position: absolute;
    top: -4px;
    left: -4px;
    background: radial-gradient(ellipse at 60% 40%, #444 60%, #222 100%);
    color: white;
    font-weight: bold;
    font-size: 0.6rem;
    min-width: 14px;
    height: 14px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #bfa14a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    z-index: 1;
    text-shadow: 0 1px 2px #000;
  }
</style>
