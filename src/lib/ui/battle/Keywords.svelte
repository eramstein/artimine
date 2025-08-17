<script lang="ts">
  import type { UnitKeywords } from '@lib/_model';
  import Tooltip from '../Tooltip.svelte';

  let { keywords }: { keywords: UnitKeywords } = $props();

  // Tooltip state
  let hoveredKeyword = $state<string | null>(null);

  // Icon lookup object
  const keywordIcons = {
    ranged: '🏹',
    haste: '⚡',
    moveAndAttack: '🔄',
    retaliate: '⚔️',
    armor: '🛡️',
    resist: '🌀',
    poisonous: '☠️',
    regeneration: '💚',
    trample: '🐘',
    zerk: '💥',
  };

  // Tooltip content for each keyword
  const tooltipContent = {
    ranged: 'Ranged: Can attack without being adjacent to the target.',
    haste: 'Haste: Can attack immediately when deployed.',
    moveAndAttack: 'Move and Attack: Can move and then attack in the same turn.',
    zerk: 'Zerk: Attacks automatically on turn start.',
    retaliate: (value: number) =>
      `Retaliate ${value}: When this unit is attacked, it deals ${value} damage back to the attacker.`,
    armor: (value: number) => `Armor ${value}: This unit takes ${value} less damage from attacks.`,
    resist: (value: number) =>
      `Resist ${value}: This unit takes ${value} less damage from spells and abilities.`,
    poisonous:
      'Poisonous: When this unit deals damage, the target is poisoned and takes 1 damage at the start of each turn.',
    regeneration: (value: number) =>
      `Regeneration ${value}: This unit heals ${value} health at the start of each turn.`,
    trample: 'Trample: Excess damage is dealt to the unit, land or player behind.',
  };

  function handleMouseEnter(keyword: string) {
    hoveredKeyword = keyword;
  }

  function handleMouseLeave() {
    hoveredKeyword = null;
  }

  // Get all active keywords with their values
  let activeKeywords = $derived(() => {
    const result: Array<{ key: string; value?: number; icon: string }> = [];

    Object.entries(keywords).forEach(([key, value]) => {
      if (value && key in keywordIcons) {
        if (typeof value === 'number') {
          result.push({ key, value, icon: keywordIcons[key as keyof typeof keywordIcons] });
        } else if (value === true) {
          result.push({ key, icon: keywordIcons[key as keyof typeof keywordIcons] });
        }
      }
    });

    return result;
  });
</script>

<div class="keywords">
  {#each activeKeywords() as { key, value, icon }}
    <Tooltip
      content={typeof tooltipContent[key as keyof typeof tooltipContent] === 'function'
        ? (tooltipContent[key as keyof typeof tooltipContent] as Function)(value)
        : tooltipContent[key as keyof typeof tooltipContent]}
      show={hoveredKeyword === key}
    >
      <div
        class="keyword"
        onmouseenter={() => handleMouseEnter(key)}
        onmouseleave={handleMouseLeave}
      >
        <span class="keyword-icon">{icon}</span>
        {#if value !== undefined}
          <span class="keyword-value">{value}</span>
        {/if}
      </div>
    </Tooltip>
  {/each}
</div>

<style>
  .keywords {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .keyword {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 2px;
    border: 1px solid var(--color-golden);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    position: relative;
  }

  .keyword-icon {
    font-size: 0.9rem;
  }

  .keyword-value {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--color-golden);
    color: black;
    font-weight: bold;
    font-size: 0.6rem;
    min-width: 14px;
    height: 14px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(0, 0, 0, 0.8);
    z-index: 0;
  }
</style>
