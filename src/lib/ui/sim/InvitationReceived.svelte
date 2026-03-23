<script lang="ts">
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import { writeInvitation } from '@/lib/llm/invitation';
  import { scheduleActivity } from '@/lib/sim/schedule';
  
  let characterKey = $derived(uiState.activeInvitationCharacterKey);
  let character = $derived(characterKey ? gs.characters[characterKey] : null);
  let invitation = $derived(character?.invitation);
  
  let sceneDescription = $state<string | null>(null);
  let isLoading = $state(false);

  // Load the invitation scene from LLM when it opens
  $effect(() => {
    if (character && character.invitation && !sceneDescription && !isLoading) {
      isLoading = true;
      writeInvitation(character.key).then(desc => {
        sceneDescription = desc;
        isLoading = false;
      }).catch(err => {
        console.error(err);
        sceneDescription = "Error loading scene.";
        isLoading = false;
      });
    }
  });

  function handleAccept() {
    if (!character || !invitation) return;
    
    // Accept calls scheduleActivity
    scheduleActivity(
      invitation.activity,
      invitation.day,
      invitation.dayPeriod,
      gs.places[invitation.place] // place is an index in gs.places according to scheduleActivity API
    );
    
    // Clear invitation
    character.invitation = null;
    handleClose();
  }

  function handleRefuse() {
    if (!character) return;
    
    // Refuse deletes invitation
    character.invitation = null;
    handleClose();
  }

  function handleClose() {
    uiState.activeInvitationCharacterKey = null;
    sceneDescription = null; // Important to reset so it triggers again for next character
  }
</script>

{#if character && invitation}
  <div class="event-view">
    <div class="event-header">
      <h2>Invitation from {character.name}</h2>
      <button class="close-header-button" onclick={handleClose} title="Close"> &times; </button>
    </div>

    <div class="event-content">
      {#if isLoading}
        <div class="description loading">
           {character.name} is approaching... (Thinking...)
        </div>
      {:else if sceneDescription}
        <div class="description">
          {sceneDescription}
        </div>
      {/if}

      <div class="actions-container">
        <button class="refuse-button" onclick={handleRefuse} disabled={isLoading}> Refuse </button>
        <button class="accept-button" onclick={handleAccept} disabled={isLoading}> Accept </button>
      </div>
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
    font-family: 'Inter', system-ui, sans-serif;
    white-space: pre-line;
  }

  .description.loading {
    color: #64748b;
    font-style: italic;
  }

  .actions-container {
    display: flex;
    gap: 16px;
    margin-top: auto;
  }

  .refuse-button, .accept-button {
    flex: 1;
    border: none;
    border-radius: 12px;
    padding: 16px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .refuse-button {
    background: #334155;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .refuse-button:hover:not(:disabled) {
    background: #475569;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  .accept-button {
    background: #4f46e5;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }

  .accept-button:hover:not(:disabled) {
    background: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
  }

  .refuse-button:active:not(:disabled), .accept-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .refuse-button:disabled, .accept-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
