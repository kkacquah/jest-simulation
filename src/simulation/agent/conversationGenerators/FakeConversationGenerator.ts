import { AgentConversationGenerator, ConversationMessage } from './AgentConversationGenerator';

/**
 * Default responses used by FakeConversationGenerator when no responses are provided
 */
export const DEFAULT_RESPONSES: ConversationMessage[] = [
  { role: 'assistant', content: 'Hello! How can I help you today?' },
  { role: 'assistant', content: 'I understand. Let me help you with that.' },
  { role: 'assistant', content: 'Is there anything else you need?' }
];

/**
 * A fake generator that returns predefined responses.
 * Useful for testing the simulation framework without a real LLM.
 */
export class FakeConversationGenerator extends AgentConversationGenerator {
  private responses: ConversationMessage[];
  private currentIndex: number = 0;

  constructor(responses: ConversationMessage[] = DEFAULT_RESPONSES) {
    super();
    this.responses = responses;
  }

  initialize(): void {}

  async generateResponse(_input: ConversationMessage): Promise<ConversationMessage> {
    const response = this.responses[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.responses.length;
    return response;
  }
}
