import OpenAI from 'openai';
import { ChatCompletionAssistantMessageParam, ChatCompletionToolMessageParam } from 'openai/resources/chat/completions';

interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

type Message =
  | OpenAI.Chat.Completions.ChatCompletionUserMessageParam
  | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
  | OpenAI.Chat.Completions.ChatCompletionToolMessageParam;

export class OpenAIClient {
  private client: OpenAI;
  private tools: Tool[];
  private conversationHistory: Message[];

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    this.tools = [];
    this.conversationHistory = [];
  }

  /**
   * Set available tools for function calling
   */
  setTools(tools: Tool[]) {
    this.tools = tools;
  }

  /**
   * Add a message to the conversation history
   */
  addMessage(message: Message) {
    this.conversationHistory.push(message);
  }

  /**
   * Clear the conversation history
   */
  clearConversation() {
    this.conversationHistory = [];
  }

  /**
   * Process a message and determine if any tools should be called
   */
  async processMessage(message: string): Promise<Message> {
    // Add user message to history
    this.addMessage({
      role: 'user',
      content: message,
    } as Message);

    // Get completion from OpenAI
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: this.conversationHistory,
      tools: this.tools,
      tool_choice: 'auto',
    });

    const response = completion.choices[0].message;

    // If no tool calls needed, return the response
    if (!response.tool_calls) {
      this.addMessage({
        role: 'assistant',
        content: response.content || '',
      } as ChatCompletionAssistantMessageParam);

      return {
        role: 'assistant',
        content: response.content || 'No action needed',
      };
    }

    // Add assistant's tool calls to history
    this.addMessage({
      role: 'assistant',
      content: response.content || '',
      tool_calls: response.tool_calls,
    } as ChatCompletionAssistantMessageParam);
    
    return response;
  }

  /**
   * Add tool result to conversation history
   */
  async addToolResult(toolCallId: string, toolName: string, result: string): Promise<Message> {
    // Add tool result to history
    this.addMessage({
      role: 'tool',
      content: result,
      tool_call_id: toolCallId,
    } as ChatCompletionToolMessageParam);

    // Get completion with tool result
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: this.conversationHistory,
      tools: this.tools,
      tool_choice: 'auto',
    });

    const response = completion.choices[0].message;

    // Add assistant's response to history
    this.addMessage({
      role: 'assistant',
      content: response.content || '',
      tool_calls: response.tool_calls,
    } as ChatCompletionAssistantMessageParam);

    // If there are more tool calls, return the next one
    if (response.tool_calls && response.tool_calls.length > 0) {
      return response;
    }

    // Otherwise return final response
    return {
      role: 'assistant',
      content: response.content || 'Operation completed successfully',
    };
  }

  /**
   * Get the current conversation history
   */
  getConversationHistory(): Message[] {
    return [...this.conversationHistory];
  }
}