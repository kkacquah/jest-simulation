
export interface AssistantConversationMessage {
  role: 'assistant'
  content: string
}

export interface UserConversationMessage {
  role: 'user'
  content: string
}
/**
 * Represents a message in the conversation
 */
export type ConversationMessage  = AssistantConversationMessage | UserConversationMessage

/**
 * Abstract base class for generating agent conversation responses.
 * Implemented by various generators like DeterministicConversationGenerator and LLMConversationGenerator.
 */
export abstract class AgentConversationGenerator {
  abstract initialize(systemPrompt?: string): void
  abstract generateResponse(input: ConversationMessage): Promise<ConversationMessage>;
}
