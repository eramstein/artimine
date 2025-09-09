<script lang="ts">
  import { gs } from '../../_state/main.svelte';
  import { uiState } from '../../_state/state-ui.svelte';
  import { playerSendChat } from '../../llm/chat';

  let inputValue = $state('');
  let inputRef = $state<HTMLInputElement>();
  let messagesContainer = $state<HTMLDivElement>();

  // Reactive state for chat messages
  let chatMessages: Array<{ role: string; content: string; displayLabel: string }> = $state([]);
  let chatCharacters: Array<{ name: string }> = $state([]);

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

  async function handleSubmit() {
    if (!inputValue.trim() || uiState.chat.isStreaming) return;

    const message = inputValue.trim();
    inputValue = '';

    try {
      await playerSendChat(message);
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
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
  <div class="chat-container">
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

    <div class="chat-input-container">
      <form onsubmit={handleSubmit}>
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
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 8px 12px;
    border-radius: 12px;
    max-width: 80%;
    word-wrap: break-word;
    line-height: 1.4;
    color: white;
  }

  .user-message .message-content {
    background: rgba(52, 152, 219, 0.2);
    border-color: rgba(52, 152, 219, 0.3);
    color: #ffffff;
  }

  .npc-message .message-content {
    background: rgba(191, 161, 74, 0.2);
    border-color: rgba(191, 161, 74, 0.3);
    color: #ffffff;
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
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
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
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .chat-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .chat-input:focus {
    border-color: var(--color-golden);
    background: rgba(255, 255, 255, 0.15);
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
