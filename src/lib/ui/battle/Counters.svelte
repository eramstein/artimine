<script lang="ts">
  import { CounterType } from '@/lib/_model/enums-battle';
  import type { UnitDeployed } from '@lib/_model';
  import Tooltip from '../Tooltip.svelte';

  let { unit }: { unit: UnitDeployed } = $props();

  // Tooltip state
  let hoveredCounter = $state<string | null>(null);

  // Counter colors
  const counterColors = {
    [CounterType.Growth]: '#22c55e', // green
    [CounterType.Decay]: '#dc2626', // red
    [CounterType.Energy]: '#eab308', // yellow
    [CounterType.Rage]: '#b91c1c', // dark red
  };

  // Tooltip content for each counter type
  const tooltipContent = {
    [CounterType.Growth]: (value: number) =>
      `Growth ${value}: This unit has ${value} growth counters. Each growth counter increases power and health by 1.`,
    [CounterType.Decay]: (value: number) =>
      `Decay ${value}: This unit has ${value} decay counters. Each decay counter decreases power and health by 1.`,
    [CounterType.Energy]: (value: number) =>
      `Energy ${value}: This unit has ${value} energy counters. Energy counters can be used to activate abilities.`,
    [CounterType.Rage]: (value: number) =>
      `Rage ${value}: This unit has ${value} rage counters. Rage counters increase attack power.`,
  };

  function handleMouseEnter(counterType: string) {
    hoveredCounter = counterType;
  }

  function handleMouseLeave() {
    hoveredCounter = null;
  }

  // Get all active counters with their values
  let activeCounters = $derived(() => {
    const result: Array<{ type: CounterType; value: number; color: string }> = [];

    Object.entries(unit.counters).forEach(([counterType, value]) => {
      if (value && value > 0 && counterType in counterColors) {
        result.push({
          type: counterType as CounterType,
          value,
          color: counterColors[counterType as CounterType],
        });
      }
    });

    return result;
  });
</script>

<div class="counters">
  {#each activeCounters() as { type, value, color }}
    <Tooltip content={tooltipContent[type](value)} show={hoveredCounter === type}>
      <div
        class="counter"
        style="--counter-color: {color}"
        onmouseenter={() => handleMouseEnter(type)}
        onmouseleave={handleMouseLeave}
      >
        <span class="counter-value">{value}</span>
      </div>
    </Tooltip>
  {/each}
</div>

<style>
  .counters {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .counter {
    background: var(--counter-color);
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.3),
      0 4px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2);
    position: relative;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }

  .counter:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 8px 16px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      inset 0 -2px 4px rgba(0, 0, 0, 0.3);
  }

  .counter-value {
    font-weight: bold;
    font-size: 0.9rem;
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
</style>
