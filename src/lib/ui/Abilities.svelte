<script lang="ts">
  import type { Ability } from '../_model/model-battle';
  import { TriggerType } from '../_model/enums';
  import Tooltip from './Tooltip.svelte';

  let { abilities }: { abilities: Ability[] } = $props();

  // Tooltip state
  let hoveredAbility = $state<string | null>(null);

  // Get the first letter of each ability name for display
  let abilityLetters = $derived(() => {
    return abilities.map((ability) => ({
      name: ability.name,
      letter: ability.name.charAt(0).toUpperCase(),
      text: ability.text,
      icons: ability.icons || [],
      isActivated: ability.trigger.type === TriggerType.Activated,
    }));
  });

  function handleMouseEnter(abilityName: string) {
    hoveredAbility = abilityName;
  }

  function handleMouseLeave() {
    hoveredAbility = null;
  }
</script>

<div class="abilities">
  {#each abilityLetters() as { name, letter, text, icons, isActivated }}
    <Tooltip content={text} show={hoveredAbility === name}>
      <div
        class="ability"
        class:activated={isActivated}
        onmouseenter={() => handleMouseEnter(name)}
        onmouseleave={handleMouseLeave}
      >
        <span class="ability-letter">{letter}</span>
        {#if icons.length > 0}
          <span class="ability-icon">{icons[0]}</span>
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

  .ability.activated:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
  }

  .ability-letter {
    font-weight: bold;
    font-size: 0.9rem;
  }

  .ability-icon {
    position: absolute;
    top: -4px;
    right: -4px;
    font-size: 0.7rem;
    background: var(--color-golden);
    color: black;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(0, 0, 0, 0.8);
    z-index: 1;
  }
</style>
