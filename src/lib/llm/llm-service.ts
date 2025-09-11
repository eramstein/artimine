import { Mistral } from '@mistralai/mistralai';
import { LLM_API_MODEL } from './config';

const mistralApiKey = import.meta.env.VITE_MISTRAL_API_KEY;

const mistralClient = new Mistral({ apiKey: mistralApiKey });

interface Message {
  role: string;
  content: string;
  images?: Uint8Array[] | string[];
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  function: {
    name: string;
    arguments: {
      [key: string]: any;
    };
  };
}

export interface Tool {
  type: string;
  function: {
    name?: string;
    description?: string;
    type?: string;
    parameters?: {
      type?: string;
      $defs?: any;
      items?: any;
      required?: string[];
      properties?: {
        [key: string]: {
          type?: string | string[];
          items?: any;
          description?: string;
          enum?: any[];
        };
      };
    };
  };
}

export interface ChatOptions {
  temperature?: number;
  repeat_penalty?: number;
  top_k?: number;
  top_p?: number;
  max_tokens?: number;
}

export interface ChatRequest {
  messages: Message[];
  tools?: Tool[];
  options?: ChatOptions;
  stream?: boolean;
  responseFormat?: {
    type: string;
  };
  model?: string;
}

export interface ChatResponse {
  choices: {
    message: {
      content: string;
      toolCalls?: ToolCall[];
    };
  }[];
}

export interface StreamChunk {
  data: {
    choices: {
      delta: {
        content: string;
      };
    }[];
  };
}

export interface LLMService {
  chat(request: ChatRequest & { stream: true }): Promise<AsyncIterable<ChatResponse | StreamChunk>>;
  chat(request: ChatRequest & { stream?: false }): Promise<ChatResponse | ChatResponse>;
  getMessage(response: ChatResponse | ChatResponse): string;
  getStreamChunk(response: ChatResponse | StreamChunk): string;
  getTools(response: ChatResponse | ChatResponse): ToolCall[];
  getToolArguments(response: { [id: string]: any } | string): Record<string, any>;
}

export class MistralService implements LLMService {
  async chat(request: ChatRequest & { stream: true }): Promise<AsyncIterable<StreamChunk>>;
  async chat(request: ChatRequest & { stream?: false }): Promise<ChatResponse>;
  async chat(request: ChatRequest): Promise<ChatResponse | AsyncIterable<StreamChunk>> {
    if (request.stream) {
      return mistralClient.chat.stream({
        model: request.model || LLM_API_MODEL,
        messages: request.messages,
        tools: request.tools,
        stream: true,
        responseFormat: request.responseFormat,
        maxTokens: request.options?.max_tokens,
        options: {
          temperature: request.options?.temperature,
          repeat_penalty: request.options?.repeat_penalty,
          top_k: request.options?.top_k,
          top_p: request.options?.top_p,
        },
      }) as Promise<AsyncIterable<StreamChunk>>;
    }
    return mistralClient.chat.complete({
      model: request.model || LLM_API_MODEL,
      messages: request.messages,
      tools: request.tools,
      toolChoice: request.tools ? 'any' : 'none',
      stream: false,
      responseFormat: request.responseFormat,
      maxTokens: request.options?.max_tokens,
      options: {
        temperature: request.options?.temperature,
        repeat_penalty: request.options?.repeat_penalty,
        top_k: request.options?.top_k,
        top_p: request.options?.top_p,
      },
    }) as Promise<ChatResponse>;
  }
  getMessage(chunk: ChatResponse): string {
    return chunk.choices[0].message.content;
  }
  getStreamChunk(chunk: StreamChunk): string {
    return chunk.data.choices[0].delta.content;
  }
  getTools(response: ChatResponse): ToolCall[] {
    return response.choices[0].message.toolCalls || [];
  }
  getToolArguments(response: string): Record<string, any> {
    return JSON.parse(response);
  }
}

// Singleton instance
export const llmService: LLMService = new MistralService();
