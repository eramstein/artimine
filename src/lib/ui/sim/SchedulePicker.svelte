<script lang="ts">
  import { DayPeriod, type ActivityPlan } from '@/lib/_model';
  import { gs } from '../../_state/main.svelte';
  import { dayNames } from '../../sim/schedule';

  let { selectedDay, selectedPeriod, onSelect, onCancel } = $props<{
    selectedDay: string;
    selectedPeriod: DayPeriod;
    onSelect: (day: string, period: DayPeriod) => void;
    onCancel: () => void;
  }>();

  const periods = [DayPeriod.Morning, DayPeriod.Afternoon, DayPeriod.Evening];

  const periodLabel: Record<DayPeriod, string> = {
    [DayPeriod.Morning]: 'Morning',
    [DayPeriod.Afternoon]: 'Afternoon',
    [DayPeriod.Evening]: 'Evening',
  };

  const getDayName = (offset: number): string => dayNames[(gs.time.day + offset) % 7];

  const getActivityFor = (dayOffset: number, periodIndex: number): ActivityPlan | null => {
    const dayActivities = gs.activityPlans[dayOffset];
    if (!dayActivities) return null;
    return dayActivities[periodIndex] ?? null;
  };

  function handleSelect(dayOffset: number, period: DayPeriod) {
    const dayName = getDayName(dayOffset);
    onSelect(dayName, period);
  }
</script>

<div class="modal-overlay" onclick={onCancel}>
  <div class="picker-modal" onclick={(e) => e.stopPropagation()}>
    <div class="picker-header">
      <span>Select Time</span>
      <button class="close-btn" onclick={onCancel}>&times;</button>
    </div>
    
    <div class="picker-grid">
      <div class="corner"></div>
      {#each Array.from({ length: 7 }) as _, dayOffset}
        <div class="day-header" class:current={dayOffset === 0}>{getDayName(dayOffset)}</div>
      {/each}

      {#each periods as period, pIdx}
        <div class="period-cell" class:current={period === gs.time.period}>{periodLabel[period]}</div>
        {#each Array.from({ length: 7 }) as _, dayOffset}
          {@const ap = getActivityFor(dayOffset, pIdx)}
          <button
            class="slot {ap ? 'filled' : 'empty'} {getDayName(dayOffset) === selectedDay && period === selectedPeriod ? 'selected' : ''}"
            onclick={() => handleSelect(dayOffset, period)}
          >
            {#if ap}
              <div class="activity-type">{ap.activity.activityType}</div>
            {:else}
              <div class="empty-label">—</div>
            {/if}
          </button>
        {/each}
      {/each}
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .picker-modal {
    background: #1a1a1a;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    width: 95vw;
    max-width: 900px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .picker-header {
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: var(--color-golden);
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 1px;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
    line-height: 1;
  }

  .close-btn:hover {
    opacity: 1;
  }

  .picker-grid {
    display: grid;
    grid-template-columns: 80px repeat(7, 1fr);
    gap: 2px;
    padding: 8px;
    overflow: auto;
  }

  .day-header {
    text-align: center;
    padding: 4px 2px;
    font-size: 10px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
  }

  .day-header.current {
    color: var(--color-golden);
  }

  .period-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    background: rgba(255, 255, 255, 0.02);
  }

  .period-cell.current {
    color: var(--color-blue);
  }

  .slot {
    min-height: 48px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 3px;
    padding: 2px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
  }

  .slot:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.02);
  }

  .slot.selected {
    border-color: var(--color-golden);
    background: rgba(191, 161, 74, 0.15);
    box-shadow: 0 0 15px rgba(191, 161, 74, 0.2);
  }

  .activity-type {
    font-size: 10px;
    font-weight: 600;
    opacity: 0.9;
  }

  .empty-label {
    opacity: 0.3;
  }
</style>
