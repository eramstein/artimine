<script lang="ts">
  import { gs } from '@/lib/_state/main.svelte';
  import { setEventOutcome } from '@/lib/sim/event';

  let eventData = $derived(gs.activity.event);

  // Helper to get consistent description from LLM or Interface
  let description = $derived(eventData?.description || (eventData as any)?.eventDescription || '');
  let options = $derived(eventData?.options || []);
  let outcome = $derived(eventData?.outcome);

  function handleOptionClick(index: number) {
    setEventOutcome(index);
  }

  function handleClose() {
    gs.activity.event = undefined;
  }
</script>

{#if eventData}
  <div class="event-view">
    <div class="event-header">
      <h2>{eventData.title}</h2>
      <button class="close-header-button" onclick={handleClose} title="Close">
        &times;
      </button>
    </div>

    <div class="event-content">
      <div class="description">
        {description}
      </div>

      {#if outcome}
        <div class="outcome-container">
          <div class="outcome-description">
            {outcome.description}
          </div>

          {#if outcome.relationValuesByCharacter}
            <div class="relations-container">
              {#each Object.entries(outcome.relationValuesByCharacter) as [charName, values]}
                {@const activeChanges = Object.entries(values).filter(([_, v]) => v !== 0)}
                {#if activeChanges.length > 0}
                  <div class="char-relations">
                    <span class="char-name">{charName}:</span>
                    <div class="relation-badges">
                      {#each activeChanges as [type, val]}
                        <span class="relation-badge" class:positive={val > 0} class:negative={val < 0}>
                          {type} {val > 0 ? `+${val}` : val}
                        </span>
                      {/each}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          {/if}
          <button class="close-button" onclick={handleClose}>
            Continue
          </button>
        </div>
      {:else}
        <div class="options-container">
          {#each options as option_raw, i}
            {@const option = option_raw as any}
            <button class="option-button" onclick={() => handleOptionClick(i)}>
              <div class="option-description">{option.description || ''}</div>
              {#if option.attribute || option.relatedAttribute}
                <div class="option-meta">
                  <span class="attribute">[{option.attribute || option.relatedAttribute}]</span>
                  <span class="difficulty">DC {option.difficulty}</span>
                </div>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .event-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(15, 15, 20, 0.95);
    backdrop-filter: blur(12px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    overflow-y: auto;
  }

  .event-header {
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(255, 255, 255, 0.02);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .event-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #94a3b8;
  }

  .close-header-button {
    background: none;
    border: none;
    color: #64748b;
    font-size: 1.75rem;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s;
    line-height: 1;
    margin: -8px;
  }

  .close-header-button:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #f8fafc;
  }

  .event-content {
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .description {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #cbd5e1;
    white-space: pre-wrap;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .options-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: auto;
  }

  .option-button {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px 20px;
    color: inherit;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .option-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateX(4px);
  }

  .option-button:active {
    transform: scale(0.98);
  }

  .option-description {
    font-size: 1rem;
    font-weight: 500;
    color: #f8fafc;
  }

  .option-meta {
    display: flex;
    gap: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .attribute {
    color: #60a5fa;
  }

  .difficulty {
    color: #94a3b8;
  }

  .outcome-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeIn 0.5s ease-out;
  }

  .outcome-description {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #f8fafc;
    font-style: italic;
  }

  .close-button {
    background: #4f46e5;
    border: none;
    border-radius: 12px;
    padding: 14px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 12px;
  }

  .close-button:hover {
    background: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .relations-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .char-relations {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .char-name {
    font-size: 0.9rem;
    font-weight: 700;
    color: #94a3b8;
    min-width: 80px;
  }

  .relation-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .relation-badge {
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .relation-badge.positive {
    color: #4ade80;
    background: rgba(74, 222, 128, 0.1);
    border-color: rgba(74, 222, 128, 0.2);
  }

  .relation-badge.negative {
    color: #f87171;
    background: rgba(248, 113, 113, 0.1);
    border-color: rgba(248, 113, 113, 0.2);
  }
</style>
