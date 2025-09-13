<script lang="ts">
  import { ActionType } from '@/lib/_model';
  import { playerSendChat } from '@/lib/llm';
  import type { ActionAttempt } from '../../_model/model-game';
  import { gs } from '../../_state/main.svelte';
  import { uiState } from '../../_state/state-ui.svelte';
  import { getPlaceImagePath } from '../../_utils/asset-paths';
  import { getActionsFromText } from '../../llm/action';
  import { rewriteMessageAfterFail } from '../../llm/re-write';
  import { attemptAction } from '../../sim/actions';
  import { ACTIONS } from '../../sim/actions-map';

  let inputValue = $state('');
  let inputRef = $state<HTMLInputElement>();
  let messagesContainer = $state<HTMLDivElement>();
  let messageText = $state('');
  const backgroundStyle = $derived(() => {
    const place = gs.places[gs.player.place];
    if (!place) return '';
    const url = getPlaceImagePath(place.key);
    return `background-image: url('${url}');`;
  });

  // Reactive state for chat messages
  let chatMessages: Array<{ role: string; content: string; displayLabel: string }> = $state([]);
  let chatCharacters: Array<{ name: string }> = $state([]);

  // Actions surfaced from the LLM for user selection (single or none)
  let pendingActions: ActionAttempt[] = $state([]);

  function skipActions() {
    pendingActions = [];
    uiState.rollResults = [];
    playerSendChat(messageText);
  }

  async function confirmSelectedAction(action: ActionAttempt) {
    // Clear any previous roll results
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
    await playerSendChat(messageText);
    // upadte the game state accordingly
    const actionDef = ACTIONS[action.actionType];
    if (outcome.success && actionDef.onSuccess) {
      actionDef.onSuccess(action.args, outcome.isCritical);
    }
    if (!outcome.success && actionDef.onFailure) {
      actionDef.onFailure(action.args, outcome.isCritical);
    }
  }

  // Update chat messages when chat state changes
  $effect(() => {
    if (!gs.chat) {
      chatMessages = [];
      chatCharacters = [];
      return;
    }

    const messages = gs.chat.history
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
        displayLabel: msg.displayLabel || msg.content,
      }));

    // Add streaming content if currently streaming
    if (uiState.chat.isStreaming && uiState.chat.streamingContent) {
      messages.push({
        role: 'assistant',
        content: uiState.chat.streamingContent,
        displayLabel: uiState.chat.streamingContent,
      });
    }

    chatMessages = messages;
    chatCharacters = gs.chat.characters || [];
  });

  async function handleSubmit(shouldCheckActions: boolean = false) {
    if (!inputValue.trim() || uiState.chat.isStreaming) return;
    messageText = inputValue.trim();
    inputValue = '';

    try {
      if (shouldCheckActions) {
        const actions = await getActionsFromText(messageText);
        pendingActions = actions as ActionAttempt[];
        if (pendingActions.length === 0) {
          await playerSendChat(messageText);
        }
      } else {
        await playerSendChat(messageText);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(false); // Regular Enter - skip action checking
    } else if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      handleSubmit(true); // Shift+Enter - check for actions
    }
  }

  function formatMessageContent(content: string): string {
    // Basic formatting for better readability
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  function getCharacterName(role: string): string {
    if (role === 'user') {
      return gs.player.name;
    }
    if (role === 'assistant') {
      return chatCharacters.map((character) => character.name).join(', ');
    }
    return role;
  }

  function getMessageClass(role: string): string {
    if (role === 'user') {
      return 'message user-message';
    }
    return 'message npc-message';
  }

  function scrollToBottom(smooth: boolean = true) {
    if (!messagesContainer) return;
    const top = messagesContainer.scrollHeight;
    try {
      messagesContainer.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
    } catch (_) {
      messagesContainer.scrollTop = top;
    }
  }

  // Auto-scroll when messages update or streaming content changes
  $effect(() => {
    // Touch dependencies
    const _len = chatMessages.length;
    const _streaming = uiState.chat.isStreaming;
    const _streamText = uiState.chat.streamingContent;

    // Defer until DOM paints
    requestAnimationFrame(() => scrollToBottom(!_streaming));
  });
</script>

{#if gs.chat}
  <div class="chat-container" style={backgroundStyle()}>
    <div class="chat-messages" id="chat-messages" bind:this={messagesContainer}>
      {#each chatMessages as message}
        <div class={getMessageClass(message.role)}>
          <div class="message-header">
            <span class="sender">{getCharacterName(message.role)}</span>
          </div>
          <div class="message-content">
            {@html formatMessageContent(message.displayLabel)}
          </div>
        </div>
      {/each}

      {#if uiState.chat.isStreaming}
        <div class="streaming-indicator">
          <span class="typing-dots">...</span>
        </div>
      {/if}
    </div>

    {#if pendingActions.length > 0 || uiState.rollResults.length}
      <div class="actions-panel">
        {#if pendingActions.length > 0}
          <div class="actions-header">Suggested actions</div>
          <div class="actions-list">
            {#each pendingActions as act, i}
              <button
                class="action-button"
                onclick={() => confirmSelectedAction(act)}
                title={JSON.stringify(act.args)}
              >
                {ACTIONS[act.actionType]?.getLabel?.(act.args) ?? act.actionType}
              </button>
            {/each}
            <button class="action-button skip-button" onclick={skipActions}>Skip</button>
          </div>
        {/if}

        {#if uiState.rollResults.length && uiState.rollResults.length > 0}
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
        {/if}
      </div>
    {/if}

    <div class="chat-input-container">
      <form onsubmit={() => handleSubmit(false)}>
        <div class="input-wrapper">
          <input
            bind:this={inputRef}
            bind:value={inputValue}
            onkeydown={handleKeydown}
            placeholder="Type your message..."
            disabled={uiState.chat.isStreaming}
            class="chat-input"
          />
        </div>
      </form>
    </div>
  </div>
{:else}
  <div class="no-chat">
    <p>No active chat session</p>
  </div>
{/if}

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
    overflow: hidden;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .chat-header {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px 8px 0 0;
  }

  .chat-participants {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .participant {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-golden);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.1);
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

  .user-message {
    align-items: flex-start;
  }

  .npc-message {
    align-items: flex-start;
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
    max-width: 80%;
    word-wrap: break-word;
    line-height: 1.4;
    color: white;
  }

  .user-message .message-content {
    background: rgba(30, 45, 60, 0.85);
    border-color: rgba(120, 150, 180, 0.35);
    color: #f3f3f3;
  }

  .npc-message .message-content {
    background: rgba(60, 50, 30, 0.9);
    border-color: rgba(191, 161, 74, 0.3);
    color: #f3f3f3;
  }

  .streaming-indicator {
    display: flex;
    align-items: center;
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

  .actions-panel {
    margin: 0 16px 8px 16px;
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

  .action-button.selected {
    background: rgba(191, 161, 74, 0.25);
    border-color: rgba(191, 161, 74, 0.7);
    color: #fff;
  }

  .actions-controls {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .roll-results-header {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8px;
    font-weight: 600;
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

  .skip-button {
    padding: 6px 10px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 12px;
  }

  .confirm-button {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid var(--color-golden);
    background: var(--color-golden);
    color: #1a1a1a;
    cursor: pointer;
    font-size: 12px;
  }

  .confirm-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    background: rgba(0, 0, 0, 0.76);
  }

  .chat-input:disabled {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.4);
    border-color: rgba(255, 255, 255, 0.1);
  }

  /* Removed send-button styles as the button is no longer used */

  .no-chat {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
  }

  /* Scrollbar styling */
  .chat-messages::-webkit-scrollbar {
    width: 6px;
  }

  .chat-messages::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .chat-messages::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  .chat-messages::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
</style>
