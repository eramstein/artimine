<script lang="ts">
  import { CounterType } from '@/lib/_model/enums-battle';
  import type { UnitDeployed } from '@lib/_model';
  import Tooltip from '../Tooltip.svelte';

  let { unit }: { unit: UnitDeployed } = $props();

  // Tooltip state
  let hoveredCounter = $state<string | null>(null);

  // Animation state
  let previousCounters = $state<Map<string, number>>(new Map());
  let animationStates = $state<Map<string, { isNew: boolean; valueChanged: boolean }>>(new Map());

  // Counter background images
  const counterImages = {
    [CounterType.Growth]: '/assets/images/tokens/counter_growth.png',
    [CounterType.Decay]: '/assets/images/tokens/counter_decay.png',
    [CounterType.Energy]: '/assets/images/tokens/counter_energy.png',
    [CounterType.Rage]: '/assets/images/tokens/counter_rage.png',
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

  // Track changes and update animation states
  $effect(() => {
    // Clear previous animation states
    animationStates.clear();

    Object.entries(unit.counters).forEach(([counterType, value]) => {
      if (value && value > 0 && counterType in counterImages) {
        const previousValue = previousCounters.get(counterType) || 0;
        const isNew = previousValue === 0;
        const valueChanged = previousValue > 0 && previousValue !== value;

        animationStates.set(counterType, { isNew, valueChanged });
      }
    });

    // Update previous counters for next comparison
    previousCounters.clear();
    Object.entries(unit.counters).forEach(([counterType, value]) => {
      if (value && value > 0) {
        previousCounters.set(counterType, value);
      }
    });
  });

  // Get all active counters with their values and animation states
  let activeCounters = $derived(() => {
    const result: Array<{
      type: CounterType;
      value: number;
      image: string;
      isNew: boolean;
      valueChanged: boolean;
    }> = [];

    Object.entries(unit.counters).forEach(([counterType, value]) => {
      if (value && value > 0 && counterType in counterImages) {
        const animationState = animationStates.get(counterType) || {
          isNew: false,
          valueChanged: false,
        };

        result.push({
          type: counterType as CounterType,
          value,
          image: counterImages[counterType as CounterType],
          isNew: animationState.isNew,
          valueChanged: animationState.valueChanged,
        });
      }
    });
    return result;
  });
</script>

<div class="counters">
  {#each activeCounters() as { type, value, image, isNew, valueChanged }}
    <Tooltip content={tooltipContent[type](value)} show={hoveredCounter === type}>
      <div
        class="counter"
        class:new={isNew}
        class:value-changed={valueChanged}
        style="--counter-image: url('{image}')"
        onmouseenter={() => handleMouseEnter(type)}
        onmouseleave={handleMouseLeave}
      >
        {#if value > 1}
          <span class="counter-value" class:value-changed={valueChanged}>{value}</span>
        {/if}
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
    background: var(--counter-image);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }

  /* Entrance animation for new counters */
  .counter.new {
    animation: counterEntrance 0.5s ease-out;
  }

  /* Value change animation */
  .counter.value-changed {
    animation: counterValueChange 0.4s ease-in-out;
  }

  @keyframes counterEntrance {
    0% {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) rotate(-90deg);
      opacity: 0.8;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes counterValueChange {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.3);
    }
    100% {
      transform: scale(1);
    }
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
    transition: transform 0.3s ease;
  }

  /* Value change animation for the text */
  .counter-value.value-changed {
    animation: valueTextChange 0.4s ease-in-out;
  }

  @keyframes valueTextChange {
    0% {
      transform: scale(1);
      color: white;
    }
    50% {
      transform: scale(1.2);
      color: #ffeb3b;
    }
    100% {
      transform: scale(1);
      color: white;
    }
  }
</style>
