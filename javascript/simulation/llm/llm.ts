import OpenAI from 'openai';
import { ConversationMessage } from '../agent/conversationGenerators/BaseConversationGenerator';

export class OpenAIClient {
  private client: OpenAI;
  private model: string;
  private messageHistory: (OpenAI.Chat.ChatCompletionUserMessageParam | OpenAI.Chat.ChatCompletionAssistantMessageParam | OpenAI.Chat.ChatCompletionSystemMessageParam)[] = [];

  constructor({
    model,
  }: {
    model: string;
  }) {
    this.client = new OpenAI();
    this.model = model;
  }

  initializeChat(systemPrompt: string): void {
    this.messageHistory.push({
      role: 'system',
      content: systemPrompt
    });
  }

  async chat(message: ConversationMessage): Promise<ConversationMessage> {
    // Convert our message format to OpenAI's format
    const openAIMessage: OpenAI.Chat.ChatCompletionUserMessageParam | OpenAI.Chat.ChatCompletionAssistantMessageParam = {
      role: message.role as 'user' | 'assistant',
      content: message.content
    };

    // Add message to history
    this.messageHistory.push(openAIMessage);

    // Get completion from OpenAI
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: this.messageHistory,
      temperature: 0.7,
    });

    // Get the response
    const response = completion.choices[0].message;

    // Add response to history
    this.messageHistory.push(response);

    // Convert back to our message format
    return {
      role: response.role,
      content: response.content || ''
    };
  }
}