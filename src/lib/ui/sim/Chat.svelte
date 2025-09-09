<script lang="ts">
  import { gs } from '../../_state/main.svelte';
  import { uiState } from '../../_state/state-ui.svelte';
  import { playerSendChat } from '../../llm/chat';

  let inputValue = $state('');
  let inputRef = $state<HTMLInputElement>();

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
</script>

{#if gs.chat}
  <div class="chat-container">
    <div class="chat-header">
      <h3>Chat</h3>
      <div class="chat-participants">
        {#each chatCharacters as character}
          <span class="participant">{character.name}</span>
        {/each}
      </div>
    </div>

    <div class="chat-messages" id="chat-messages">
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
          <button
            type="submit"
            disabled={!inputValue.trim() || uiState.chat.isStreaming}
            class="send-button"
          >
            Send
          </button>
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
    max-height: 600px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .chat-header {
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
  }

  .chat-header h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .chat-participants {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .participant {
    background: #e3f2fd;
    color: #1976d2;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 200px;
    max-height: 400px;
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .user-message {
    align-items: flex-end;
  }

  .npc-message {
    align-items: flex-start;
  }

  .message-header {
    font-size: 12px;
    font-weight: 600;
    color: #666;
  }

  .user-message .message-header {
    color: #1976d2;
  }

  .npc-message .message-header {
    color: #d32f2f;
  }

  .message-content {
    background: #f5f5f5;
    padding: 8px 12px;
    border-radius: 12px;
    max-width: 80%;
    word-wrap: break-word;
    line-height: 1.4;
  }

  .user-message .message-content {
    background: #e3f2fd;
    color: #1976d2;
  }

  .npc-message .message-content {
    background: #fff3e0;
    color: #333;
  }

  .streaming-indicator {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    color: #666;
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
    padding: 16px;
    border-top: 1px solid #eee;
    background: #f8f9fa;
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
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  .chat-input:focus {
    border-color: #1976d2;
  }

  .chat-input:disabled {
    background: #f5f5f5;
    color: #999;
  }

  .send-button {
    padding: 8px 16px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .send-button:hover:not(:disabled) {
    background: #1565c0;
  }

  .send-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .no-chat {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #666;
    font-style: italic;
  }

  /* Scrollbar styling */
  .chat-messages::-webkit-scrollbar {
    width: 6px;
  }

  .chat-messages::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .chat-messages::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .chat-messages::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>
