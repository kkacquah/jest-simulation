import { AgentConversationGenerator, ConversationMessage } from './BaseConversationGenerator';

/**
 * A fake generator that converts a list of strings into user messages.
 * Useful for testing the simulation framework without a real LLM.
 */
export class DeterministicConversationGenerator extends AgentConversationGenerator {
  private messages: ConversationMessage[];
  private currentIndex: number = 0;

  constructor(messages: string[]) {
    super();
    this.messages = messages.map(content => ({
      role: 'user',
      content
    }));
  }

  initialize(): void {}

  async generateResponse(_input: ConversationMessage): Promise<ConversationMessage> {
    const message = this.messages[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.messages.length;
    return message;
  }
}
