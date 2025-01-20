import { EventEmitter } from 'events';

/**
 * Represents a message in the conversation
 */
export interface ConversationMessage {
  role: string;
  content: string;
  [key: string]: unknown;
}

/**
 * Abstract base class for generating agent conversation responses.
 * This will eventually be implemented by an LLM-based generator.
 */
export abstract class AgentConversationGenerator {
  abstract generateResponse(input: ConversationMessage): Promise<ConversationMessage>;
}

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

  async generateResponse(input: ConversationMessage): Promise<ConversationMessage> {
    if (this.currentIndex >= this.responses.length) {
      // If we run out of responses, cycle back to the beginning
      this.currentIndex = 0;
    }

    const response = this.responses[this.currentIndex];
    this.currentIndex++;
    return response;
  }

  /**
   * Reset the generator to start from the beginning of the responses
   */
  reset(): void {
    this.currentIndex = 0;
  }
}

/**
 * Default responses used by FakeConversationGenerator when no responses are provided
 */
export const DEFAULT_RESPONSES: ConversationMessage[] = [
  { role: 'assistant', content: 'I understand your message.' },
  { role: 'assistant', content: 'That\'s an interesting point.' },
  { role: 'assistant', content: 'Let me help you with that.' },
  { role: 'assistant', content: 'Here\'s what I think about that.' },
  { role: 'assistant', content: 'Is there anything else you\'d like to know?' }
];
