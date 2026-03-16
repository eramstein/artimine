<script lang="ts">
  import { ActivityType, DayPeriod, ActionType } from '@/lib/_model';
  import { gs } from '../../_state/main.svelte';
  import { ACTIONS } from '../../sim/actions-map';
  import { dayNames } from '../../sim/schedule';
  import SchedulePicker from './SchedulePicker.svelte';

  let { characters, onCancel, onSuccessDone } = $props<{
    characters: any[];
    onCancel: () => void;
    onSuccessDone: () => void;
  }>();

  // Initialize with all characters in the scene selected
  let selectedPeople = $state<string[]>(characters.map((c: any) => c.name));
  let selectedActivity = $state<ActivityType>(ActivityType.Chill);
  let selectedDestination = $state<string>(gs.places.find(p => p.index === gs.player.place)?.name || gs.places[0]?.name || '');
  let selectedDay = $state<string>(dayNames[(gs.time.day + 1) % 7]);
  let selectedTime = $state<DayPeriod>(DayPeriod.Evening);

  let showPicker = $state(false);
  let checkResult = $state<{ success: boolean; description: string } | null>(null);

  const scheduleAction = ACTIONS[ActionType.ScheduleActivity];

  const activities = [ActivityType.Gaming, ActivityType.Social, ActivityType.Date];
  const timePeriods = [DayPeriod.Morning, DayPeriod.Afternoon, DayPeriod.Evening];

  function togglePerson(name: string) {
    if (selectedPeople.includes(name)) {
      selectedPeople = selectedPeople.filter(p => p !== name);
    } else {
      selectedPeople = [...selectedPeople, name];
    }
  }

  function handleCheck() {
    if (selectedPeople.length === 0) {
      checkResult = { success: false, description: "Select at least one person." };
      return;
    }
    const args = {
      people: selectedPeople,
      activityType: selectedActivity,
      destination: selectedDestination,
      day: selectedDay,
      time: selectedTime,
    };
    const outcome = scheduleAction.checkSuccess(args);
    checkResult = {
      success: outcome.success,
      description: outcome.success ? outcome.descriptionSuccess : outcome.descriptionFailure,
    };
  }

  function handleConfirm() {
    if (!checkResult?.success) return;
    const args = {
      people: selectedPeople,
      activityType: selectedActivity,
      destination: selectedDestination,
      day: selectedDay,
      time: selectedTime,
    };
    scheduleAction.onSuccess?.(args);
    onSuccessDone();
  }

  function handleTimeSelect(day: string, period: DayPeriod) {
    selectedDay = day;
    selectedTime = period;
    showPicker = false;
  }

  const inviteLabel = $derived.by(() => {
    if (selectedPeople.length === 0) return "Invite someone...";
    if (selectedPeople.length === 1) return `Invite ${selectedPeople[0]}`;
    if (selectedPeople.length === 2) return `Invite ${selectedPeople[0]} and ${selectedPeople[1]}`;
    return `Invite ${selectedPeople.slice(0, -1).join(', ')} and ${selectedPeople.slice(-1)}`;
  });
</script>

<div class="wizard-container">
  <div class="wizard-header">
    <div class="invite-summary">{inviteLabel}</div>
    <div class="people-chips">
      {#each characters as char}
        <button 
          class="person-chip {selectedPeople.includes(char.name) ? 'selected' : ''}" 
          onclick={() => togglePerson(char.name)}
        >
          {char.name}
        </button>
      {/each}
    </div>
  </div>
  
  <div class="form-group">
    <label>What:</label>
    <div class="chips-row">
      {#each activities as act}
        <button 
          class="chip {selectedActivity === act ? 'selected' : ''}" 
          onclick={() => selectedActivity = act}
        >
          {act}
        </button>
      {/each}
    </div>
  </div>

  <div class="form-group">
    <label>Where:</label>
    <div class="chips-row">
      {#each gs.places as place}
        <button 
          class="chip {selectedDestination === place.name ? 'selected' : ''}" 
          onclick={() => selectedDestination = place.name}
        >
          {place.name}
        </button>
      {/each}
    </div>
  </div>

  <div class="form-group">
    <label>When:</label>
    <button class="time-btn" onclick={() => showPicker = true}>
      <span class="day">{selectedDay}</span>
      <span class="period">{selectedTime}</span>
    </button>
  </div>

  {#if checkResult}
    <div class="result-message {checkResult.success ? 'success' : 'failure'}">
      {checkResult.description}
    </div>
  {/if}

  <div class="wizard-actions">
    {#if !checkResult?.success}
      <button class="primary-btn" onclick={handleCheck}>Check</button>
    {:else}
      <button class="primary-btn confirm-btn" onclick={handleConfirm}>Confirm</button>
    {/if}
    <button class="secondary-btn" onclick={onCancel}>Cancel</button>
  </div>
</div>

{#if showPicker}
  <SchedulePicker 
    {selectedDay} 
    selectedPeriod={selectedTime} 
    onSelect={handleTimeSelect} 
    onCancel={() => showPicker = false} 
  />
{/if}

<style>
  .wizard-container {
    padding: 16px;
    background: rgba(30, 30, 35, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    color: white;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  }

  .wizard-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 12px;
  }

  .invite-summary {
    font-weight: 700;
    color: var(--color-golden);
    font-size: 16px;
    letter-spacing: 0.5px;
  }

  .people-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .person-chip {
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .person-chip.selected {
    background: var(--color-blue);
    border-color: var(--color-blue);
    color: white;
    font-weight: 600;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }


  label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.3);
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .chip:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .chip.selected {
    background: rgba(191, 161, 74, 0.2);
    border-color: var(--color-golden);
    color: var(--color-golden);
    font-weight: 600;
  }

  .time-btn {
    display: flex;
    gap: 12px;
    align-items: center;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 10px 16px;
    cursor: pointer;
    transition: all 0.2s;
    width: fit-content;
  }

  .time-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--color-golden);
  }

  .time-btn .day {
    color: white;
    font-weight: 600;
    font-size: 14px;
  }

  .time-btn .period {
    color: var(--color-blue);
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 700;
  }


  .result-message {
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.5;
  }

  .result-message.success {
    background: rgba(34, 197, 94, 0.1);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .result-message.failure {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .wizard-actions {
    display: flex;
    gap: 10px;
    margin-top: 4px;
  }

  .primary-btn {
    background: var(--color-golden);
    color: black;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .primary-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .confirm-btn {
    background: #22c55e;
    color: white;
  }

  .secondary-btn {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .secondary-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    color: white;
  }
</style>
