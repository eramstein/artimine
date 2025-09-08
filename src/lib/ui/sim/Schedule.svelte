<script lang="ts">
  import { DayPeriod, UiView, type ActivityPlan } from '@/lib/_model';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import { getPlaceImagePath } from '@/lib/_utils/asset-paths';
  import { dayNames, skipTo } from '@/lib/sim/schedule';

  const periods = [DayPeriod.Morning, DayPeriod.Afternoon, DayPeriod.Evening];

  const periodLabel: Record<DayPeriod, string> = {
    [DayPeriod.Morning]: 'Morning',
    [DayPeriod.Afternoon]: 'Afternoon',
    [DayPeriod.Evening]: 'Evening',
  };

  const getDayName = (offset: number): string => dayNames[(gs.time.day + offset) % 7];

  const getPlaceName = (placeIndex: number | undefined): string => {
    return gs.places[placeIndex ?? 0].name;
  };

  const getActivityFor = (dayOffset: number, periodIndex: number): ActivityPlan | null => {
    const dayActivities = gs.activities[dayOffset];
    if (!dayActivities) return null;
    return dayActivities[periodIndex] ?? null;
  };

  const getPlaceThumb = (placeIndex: number | undefined): string => {
    if (placeIndex == null) return '';
    const place = gs.places.find((p) => p.index === placeIndex);
    return place ? getPlaceImagePath(place.key) : '';
  };

  // Animated skip state
  let isSkipping = $state(false);
  let animDayOffset = $state(0);
  let animPeriodIndex = $state(0);

  function getCurrentPeriodIndex(): number {
    return periods.indexOf(gs.time.period);
  }

  async function animateSkipTo(targetDayOffset: number, targetPeriodIndex: number) {
    if (isSkipping) return;
    isSkipping = true;
    animDayOffset = 0;
    animPeriodIndex = getCurrentPeriodIndex();

    // Step through periods/days until target
    const stepDelayMs = 180;
    while (animDayOffset !== targetDayOffset || animPeriodIndex !== targetPeriodIndex) {
      await new Promise((r) => setTimeout(r, stepDelayMs));
      animPeriodIndex++;
      if (animPeriodIndex >= 3) {
        animPeriodIndex = 0;
        animDayOffset++;
      }
      // Safety break (should not happen)
      if (animDayOffset > 7) break;
    }

    // Briefly hold on target for feedback
    await new Promise((r) => setTimeout(r, 160));

    isSkipping = false;
    // Perform actual state change
    skipTo(targetDayOffset, periods[targetPeriodIndex]);
    uiState.currentView = UiView.CurrentPlace;
  }
</script>

<div class="schedule">
  <div class="corner"></div>
  {#each Array.from({ length: 7 }) as _, dayOffset}
    <div class="day-header" class:current={dayOffset === 0}>{getDayName(dayOffset)}</div>
  {/each}

  {#each periods as _period, pIdx}
    <div class="period-cell" class:current={_period === gs.time.period}>{periodLabel[_period]}</div>
    {#each Array.from({ length: 7 }) as _, dayOffset}
      {#if getActivityFor(dayOffset, pIdx)}
        {@const ap = getActivityFor(dayOffset, pIdx)!}
        <div
          class="slot filled"
          class:current-slot={isSkipping
            ? dayOffset === animDayOffset && pIdx === animPeriodIndex
            : dayOffset === 0 && _period === gs.time.period}
          data-period={_period}
          onclick={() => animateSkipTo(dayOffset, pIdx)}
        >
          <div class="title">
            <span class="activity-type">{ap.activity.activityType}</span>
            <span class="place">{getPlaceName(ap.place)}</span>
          </div>
          <div class="meta">
            {#if ap.place !== undefined}
              <img class="place-thumb" src={getPlaceThumb(ap.place)} />
            {/if}
            {#if ap.activity.participants.length}
              <span class="participants">
                {ap.activity.participants
                  .map((key) => gs.characters[key]?.name)
                  .filter(Boolean)
                  .join(', ')}
              </span>
            {/if}
          </div>
        </div>
      {:else}
        <div class="slot empty" data-period={_period}>
          <div class="title">—</div>
          <div class="meta">&nbsp;</div>
        </div>
      {/if}
    {/each}
  {/each}
</div>

<style>
  .schedule {
    position: relative;
    display: grid;
    grid-template-columns: 120px repeat(7, 1fr);
    gap: 8px;
    padding: 16px;
    align-items: stretch;
  }

  .corner {
    display: block;
  }

  .day-header {
    text-align: center;
    padding: 8px 6px;
    font-weight: bold;
    color: #ffd700;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
  }

  .day-header.current {
    background: rgba(255, 215, 0, 0.15);
    border-color: rgba(255, 215, 0, 0.35);
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.15) inset;
  }

  .period-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.85);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
  }

  .period-cell.current {
    background: rgba(100, 149, 237, 0.15);
    border-color: rgba(100, 149, 237, 0.35);
    box-shadow: 0 0 0 2px rgba(100, 149, 237, 0.15) inset;
  }

  .slot {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    padding: 10px 8px;
    min-height: 72px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
  }

  .slot.empty {
    opacity: 0.6;
  }

  .slot.filled {
    background: rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition:
      transform 0.12s ease,
      box-shadow 0.12s ease,
      background 0.12s ease;
  }

  .slot.filled:hover {
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
    transform: translateY(-1px);
  }

  .slot.filled.current-slot {
    border-color: rgba(255, 215, 0, 0.65);
    box-shadow:
      0 0 0 2px rgba(255, 215, 0, 0.3) inset,
      0 2px 10px rgba(0, 0, 0, 0.25);
    animation: pulse 0.8s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from {
      box-shadow:
        0 0 0 2px rgba(255, 215, 0, 0.25) inset,
        0 2px 10px rgba(0, 0, 0, 0.25);
    }
    to {
      box-shadow:
        0 0 0 3px rgba(255, 215, 0, 0.45) inset,
        0 2px 14px rgba(0, 0, 0, 0.35);
    }
  }

  .title {
    font-size: 14px;
    font-weight: 600;
  }

  .meta {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .place {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
    font-weight: normal;
    padding-left: 4px;
  }

  .place-thumb {
    width: 100%;
    height: auto;
    max-width: 100%;
    object-fit: contain;
    border-radius: 4px;
  }

  .participants {
    display: block;
    text-align: left;
    opacity: 0.9;
  }
</style>
