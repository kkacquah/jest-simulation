import { EventEmitter } from 'events';

/**
 * Represents a message in the conversation
 */
export interface ConversationMessage {
  role: string;
  content: string;
}

/**
 * Abstract base class for generating agent conversation responses.
 * Implemented by various generators like FakeConversationGenerator and LLMConversationGenerator.
 */
export abstract class AgentConversationGenerator {
  abstract initialize(systemPrompt?: string): void
  abstract generateResponse(input: ConversationMessage): Promise<ConversationMessage>;
}
