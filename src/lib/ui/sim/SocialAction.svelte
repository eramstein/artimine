<script lang="ts">
  import { ActionType } from '@/lib/_model';
  import type { ActionAttempt, Npc } from '../../_model/model-game';
  import { gs } from '../../_state/main.svelte';
  import { initTrade, uiState } from '../../_state/state-ui.svelte';
  import { getActionsFromText } from '../../llm/action';
  import { writeSceneDescription } from '../../llm/one-shot';
  import { rewriteMessageAfterFail } from '../../llm/re-write';
  import { attemptAction } from '../../sim/actions';
  import { ACTIONS } from '../../sim/actions-map';
  import { initDeckSelection } from '../../sim/ongoing-battle';

  let inputValue = $state('');
  let submitted = $state(false);
  let responseText = $state('');
  let inputRef = $state<HTMLInputElement>();
  let messageText = $state('');
  let pendingActions: ActionAttempt[] = $state([]);
  let selectedAction: ActionAttempt | null = $state(null);
  let messagesRef = $state<HTMLDivElement>();

  const quickActions = {
    'Play Game': () => initDeckSelection(gs.chat?.characters[0] as Npc),
    Trade: () => initTrade(gs.chat?.characters[0] as Npc),
    Invite: () => {
      inputValue = `${gs.player.name} invites ${gs.chat?.characters.map((c) => c.name).join(', ')} to play a game at his place`;
      inputRef?.focus();
    },
    Charm: () => {
      inputValue = `${gs.player.name} tries his best to charm ${gs.chat?.characters.map((c) => c.name).join(', ')}`;
      inputRef?.focus();
    },
    Befriend: () => {
      inputValue = `${gs.player.name} tries his best to befriend ${gs.chat?.characters.map((c) => c.name).join(', ')}`;
      inputRef?.focus();
    },
  };

  $effect(() => {
    if (inputRef && !submitted && !uiState.chat.isStreaming) {
      inputRef.focus();
      uiState.rollResults = [];
    }
  });

  $effect(() => {
    if (messagesRef) {
      messagesRef.scrollTop = messagesRef.scrollHeight;
    }
  });

  function formatMessageContent(content: string): string {
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  async function handleSubmit() {
    if (submitted) return;
    const message = inputValue.trim();
    if (!message || uiState.chat.isStreaming) return;
    submitted = true;
    messageText = message;
    try {
      const actions = await getActionsFromText(messageText);
      pendingActions = actions as ActionAttempt[];
      if (pendingActions.length === 0) {
        const transcript = await writeSceneDescription(messageText);
        responseText = transcript || '';
      }
    } catch (err) {
      console.error('Error sending social action message:', err);
      responseText = 'Something went wrong. Please try again later.';
    }
  }

  function resetState() {
    inputValue = '';
    submitted = false;
    responseText = '';
    messageText = '';
    pendingActions = [];
    selectedAction = null;
    uiState.rollResults = [];
  }

  async function confirmSelectedAction(action: ActionAttempt) {
    selectedAction = action;
    uiState.rollResults = [];
    // attemptAction will set some additional info in gs to be added to the prompt (e.g. "NPC accepts")
    // the success is decided by the simulation, not the LLM
    const outcome = attemptAction(action);
    pendingActions = [];

    // if it's a failed general challenge check (e.g. the player says he does a backflip), we re-write the user prompt in case of failure
    if (action.actionType === ActionType.GeneralChallenge && !outcome.success) {
      messageText = await rewriteMessageAfterFail(messageText);
    }

    // here we ask the LLM to describe what happened, we tell it to describe a success or failure state
    const transcript = await writeSceneDescription(messageText);
    // upadte the game state accordingly
    const actionDef = ACTIONS[action.actionType];
    if (outcome.success && actionDef.onSuccess) {
      actionDef.onSuccess(action.args, outcome.isCritical);
    }
    if (!outcome.success && actionDef.onFailure) {
      actionDef.onFailure(action.args, outcome.isCritical);
    }
    responseText = transcript || '';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

<div class="chat-container">
  {#if submitted}
    <div class="chat-messages" bind:this={messagesRef}>
      {#if submitted}
        <!-- 1) User's submitted message -->
        <div class="message user-message">
          <div class="message-header"><span class="sender">{gs.player.name}</span></div>
          <div class="message-content">{messageText}</div>
        </div>

        <!-- 2) Attempted action description and roll results -->
        {#if selectedAction && uiState.rollResults.length && uiState.rollResults.length > 0}
          <div class="actions-panel">
            <div class="actions-header">Attempted action</div>
            <div class="actions-list">
              <div class="action-button">
                {ACTIONS[selectedAction.actionType]?.getLabel?.(selectedAction.args) ??
                  selectedAction.actionType}
              </div>
            </div>
            <div class="roll-results">
              {#each uiState.rollResults as result}
                <div class="roll-result">
                  <span
                    class="roll-outcome {result.success ? 'success' : 'failure'} {result.isCritical
                      ? 'critical'
                      : ''}">{result.success ? 'Success!' : 'Failure!'}</span
                  >
                  Test {result.attribute} ({gs.player.attributes[
                    result.attribute as keyof typeof gs.player.attributes
                  ]}). Difficulty {result.difficulty}. Roll: {result.roll}.
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- 3) LLM streaming indicator/response -->
        {#if uiState.chat.isStreaming}
          <div class="streaming-indicator"><span class="typing-dots">...</span></div>
        {/if}

        {#if !uiState.chat.isStreaming && responseText}
          <div class="message npc-message">
            <div class="message-header"><span class="sender">NPC</span></div>
            <div class="message-content">{@html formatMessageContent(responseText)}</div>
          </div>
        {/if}
      {/if}
    </div>
  {/if}
  {#if !submitted}
    <div class="chat-input-container">
      <div class="input-wrapper">
        <input
          bind:this={inputRef}
          bind:value={inputValue}
          onkeydown={handleKeydown}
          placeholder="Type your message..."
          disabled={submitted || uiState.chat.isStreaming}
          class="chat-input"
        />
        <button
          class="send-button"
          onclick={handleSubmit}
          disabled={submitted || uiState.chat.isStreaming}>Send</button
        >
      </div>
      <div class="quick-actions">
        <button class="action-button" onclick={() => quickActions['Play Game']()}>Play Game</button>
        <button class="action-button" onclick={() => quickActions.Trade()}>Trade</button>
        <button class="action-button" onclick={() => quickActions.Invite()}>Invite</button>
        <button class="action-button" onclick={() => quickActions.Charm()}>Charm</button>
        <button class="action-button" onclick={() => quickActions.Befriend()}>Befriend</button>
      </div>
    </div>
  {/if}

  {#if pendingActions && pendingActions.length}
    <div class="actions-panel">
      {#if pendingActions.length > 0}
        <div class="actions-header">Suggested actions</div>
        <div class="actions-list">
          {#each pendingActions as act}
            <button
              class="action-button"
              onclick={() => confirmSelectedAction(act)}
              title={JSON.stringify(act.args)}
            >
              {ACTIONS[act.actionType]?.getLabel?.(act.args) ?? act.actionType}
            </button>
          {/each}
          <button class="action-button" onclick={resetState}>Cancel</button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.8);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    color: white;
    box-sizing: border-box;
    overflow: auto;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .chat-messages {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .message-header {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
  }

  .user-message .message-header {
    color: var(--color-blue);
  }
  .npc-message .message-header {
    color: var(--color-golden);
  }

  .message-content {
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.14);
    padding: 8px 12px;
    border-radius: 12px;
    word-wrap: break-word;
    line-height: 1.4;
    color: white;
  }

  .user-message .message-content {
    background: rgba(30, 45, 60, 0.85);
    border-color: rgba(120, 150, 180, 0.35);
  }
  .npc-message .message-content {
    background: rgba(60, 50, 30, 0.9);
    border-color: rgba(191, 161, 74, 0.3);
  }

  .streaming-indicator {
    padding: 8px 12px;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
  }
  .typing-dots {
    animation: typing 1.5s infinite;
  }
  @keyframes typing {
    0%,
    60%,
    100% {
      opacity: 0.3;
    }
    30% {
      opacity: 1;
    }
  }

  .chat-input-container {
    flex: 0 0 auto;
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(0, 0, 0, 0.7);
    border-radius: 0 0 8px 8px;
  }

  .input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .chat-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 20px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    background: rgba(0, 0, 0, 0.7);
    color: #f5f5f5;
  }
  .chat-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  .chat-input:focus {
    border-color: rgba(191, 161, 74, 0.4);
  }
  .chat-input:disabled {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.4);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .send-button {
    padding: 6px 10px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.2);
    color: var(--color-golden);
    cursor: pointer;
    font-size: 12px;
  }
  .send-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .quick-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  /* Actions panel styles (mirrored from Chat.svelte) */
  .actions-panel {
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.7);
  }

  .actions-header {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8px;
    font-weight: 600;
  }

  .actions-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }

  .action-button {
    padding: 6px 10px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.2);
    color: var(--color-golden);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s ease;
  }

  .action-button:hover {
    background: rgba(191, 161, 74, 0.15);
    border-color: rgba(191, 161, 74, 0.4);
  }

  .roll-result {
    padding: 4px 0;
    margin-bottom: 2px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
  }

  .roll-outcome {
    font-weight: 600;
  }
  .roll-outcome.success {
    color: #22c55e;
  }
  .roll-outcome.failure {
    color: #ef4444;
  }
  .roll-outcome.critical {
    color: #a855f7;
  }
</style>
